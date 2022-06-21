//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PresaleService is AccessControl{
  using Counters for Counters.Counter;
  using SafeERC20 for ERC20;
  Counters.Counter presaleId;
  uint public usageFee;
  address public immutable router;
  address payable admin;

  struct presaleInfo{
    uint start;
    uint end;
    uint price;   // problem:  wei / token(wei), 0 < price <= 10e4  10000000 /10000 
    uint FirstAmount;
    uint NewestAmount;
    uint weth;    // weth amount in wei
    bool ended;
    address tokenaddress;
    address creator;
  }
  mapping(uint => presaleInfo) public presaleAddress;

  event StartPresale(uint[] starttime, uint[] endtime, uint[] prices, uint[] tokenAmounts, ERC20[] tokenAddresses);
  event Buy(address buyer, uint presaleId, uint price, uint amountMantissa);
  event EndPresale(uint presaleID, uint ethToSend, uint tokenAmountMantissa, address token);
  event WithDraw(uint presaleId, uint balance);
  event ChangeUsageFee(uint oldUsageFee, uint newUsageFee);

  constructor(uint initialusageFee, address initialadmin, address _router){
    // suggestion: use basis point for usage fee
    usageFee = initialusageFee;
    _setupRole(DEFAULT_ADMIN_ROLE, initialadmin);
    admin = payable(initialadmin);
    router = _router;
  }

  // Suggestions: encapsulate the parameters into a struct
  function startPresale(uint[] memory start, uint[] memory end, uint[] memory price, uint[] memory tokenAmounts, ERC20[] memory tokenAddress) external{
    require(start.length == end.length, "the entered inputs should have the same length");
    require(start.length == price.length, "the entered inputs should have the same length");
    require(start.length == tokenAmounts.length, "the entered inputs should have the same length");
    require(start.length == tokenAddress.length, "the entered inputs should have the same length");
    for(uint i; i < start.length; i++){
      require(tokenAddress[i].balanceOf(msg.sender) >= tokenAmounts[i], "The creater does not have enough token amounts to create this pair");
      presaleAddress[presaleId.current()] = presaleInfo(start[i], end[i], price[i], tokenAmounts[i], tokenAmounts[i], 0, false, address(tokenAddress[i]), msg.sender);
      tokenAddress[i].safeTransferFrom(msg.sender, address(this),tokenAmounts[i]);
      presaleId.increment();
    }

    emit StartPresale(start, end, price, tokenAmounts, tokenAddress);
  }

  function buy(uint presaleid, uint amountMantissa) payable public{
    require(block.timestamp >= presaleAddress[presaleid].start, "the current time has not passed the start time of this presale");
    require(block.timestamp <= presaleAddress[presaleid].end, "the current time has passed the end time of this presale");

    require(amountMantissa <= presaleAddress[presaleid].NewestAmount, "the buy amount exceed the stored amount");
    uint wethAmount = amountMantissa * presaleAddress[presaleid].price / 10000 / 10000;
    require(msg.value >= wethAmount, "You should send more eth to purchase this amount of token");
    presaleAddress[presaleid].NewestAmount -= amountMantissa;
    presaleAddress[presaleid].weth += msg.value;
    ERC20(presaleAddress[presaleid].tokenaddress).increaseAllowance(address(this), amountMantissa);
    ERC20(presaleAddress[presaleid].tokenaddress).safeTransferFrom(address(this), msg.sender, amountMantissa);


    emit Buy(msg.sender, presaleid, presaleAddress[presaleid].price, amountMantissa);

  }

  function withdraw(uint presaleid) external{
    require(msg.sender == presaleAddress[presaleid].creator, "Only the creator could withdraw");
    require(presaleAddress[presaleid].ended, "This presale has not been ended");
    require(presaleAddress[presaleid].NewestAmount > 0, "There is no token for you to withdraw");
    uint balances = IERC20(presaleAddress[presaleid].tokenaddress).balanceOf(address(this));
    presaleAddress[presaleid].NewestAmount = 0;
    ERC20(presaleAddress[presaleid].tokenaddress).increaseAllowance(address(this), balances);
    ERC20(presaleAddress[presaleid].tokenaddress).safeTransferFrom(address(this), msg.sender, balances);

    emit WithDraw(presaleId.current() - 1, balances);
  }

  function endPresale(uint presaleid) external{
    require(block.timestamp > presaleAddress[presaleid].end, "The end timestamp has not been passed yet");
    presaleAddress[presaleid].ended = true;
    uint ethToSend = presaleAddress[presaleid].weth - usageFee; // minus presaleAddress[presaleid].weth times usagefee / 10000
    uint tokenAmountMantissa = presaleAddress[presaleid].FirstAmount - presaleAddress[presaleid].NewestAmount;
    admin.transfer(usageFee);
    // the below line sends the token from this contract address instead of from the one who calls the end presale
    // IERC20(presaleAddress[presaleid].tokenaddress).transferFrom(msg.sender, address(this), tokenAmountMantissa);
    ERC20(presaleAddress[presaleid].tokenaddress).safeTransferFrom(msg.sender, address(this),tokenAmountMantissa);
    ERC20(presaleAddress[presaleid].tokenaddress).increaseAllowance(router, tokenAmountMantissa);                                      
    IUniswapV2Router02(router).addLiquidityETH{value: ethToSend}(presaleAddress[presaleid].tokenaddress, tokenAmountMantissa, tokenAmountMantissa, ethToSend, address(this), block.timestamp + 5 minutes);
    emit EndPresale(presaleid, ethToSend, tokenAmountMantissa, presaleAddress[presaleid].tokenaddress);
  }

  function changeUsageFee(uint newUsageFee) external{
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only the admin could change usage fee");
    uint oldUsageFee = usageFee;
    usageFee = newUsageFee;
    emit ChangeUsageFee(oldUsageFee, newUsageFee);
  }

  function PresaleId() view public returns (uint){
    return presaleId.current();
  }


}