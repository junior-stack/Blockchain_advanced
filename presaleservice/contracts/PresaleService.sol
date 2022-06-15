//SPDX-License-Identifier: Unlicense
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
  address public admin;

  struct presaleInfo{
    uint start;
    uint end;
    uint price;
    uint amount;
    uint weth;
    bool ended;
    address tokenaddress;
    address creator;
  }
  mapping(uint => presaleInfo) public presaleAddress;

  constructor(uint initialusageFee, address initialadmin, address _router){
    usageFee = initialusageFee;
    _setupRole(DEFAULT_ADMIN_ROLE, initialadmin);
    admin = initialadmin;
    router = _router;
  }

  function startPresale(uint[] memory start, uint[] memory end, uint[] memory price, uint[] memory tokenAmounts, ERC20[] memory tokenAddress) external{
    require(start.length == end.length, "the entered inputs should have the same length");
    require(start.length == price.length, "the entered inputs should have the same length");
    require(start.length == tokenAmounts.length, "the entered inputs should have the same length");
    require(start.length == tokenAddress.length, "the entered inputs should have the same length");
    for(uint i; i < start.length; i++){
      presaleAddress[presaleId.current()] = presaleInfo(start[i], end[i], price[i], tokenAmounts[i], 0, false, address(tokenAddress[i]), msg.sender);
      tokenAddress[i].safeTransfer(address(this), tokenAddress[i].balanceOf(msg.sender));
      presaleId.increment();
    }
  }

  function buy(uint presaleid, uint amountMantissa) external{
    require(block.timestamp >= presaleAddress[presaleid].start, "the current time has not passed the start time of this presale");
    require(block.timestamp <= presaleAddress[presaleid].end, "the current time has passed the end time of this presale");

    uint wethAmount = presaleAddress[presaleid].price * amountMantissa;
    require(msg.value >= wethAmount, "You should send more eth to purchase this amount of token");
    presaleAddress[presaleid].weth = wethAmount;
    ERC20(presaleAddress[presaleid].tokenaddress).safeTransfer(msg.sender, amountMantissa);
  }

  function withdraw(uint presaleid) external{
    require(msg.sender == presaleAddress[presaleid].creator, "Only the creator could withdraw");
    require(presaleAddress[presaleid].ended, "This presale has not been ended");
    ERC20(presaleAddress[presaleid].tokenaddress).safeTransfer(msg.sender, IERC20(presaleAddress[presaleid].tokenaddress).balanceOf(address(this)));
  }

  function endPresale(uint presaleid) external{
    require(block.timestamp > presaleAddress[presaleid].end, "The end timestamp has not been passed yet");
    presaleAddress[presaleid].ended = true;
    uint ethToSend = presaleAddress[presaleid].weth - usageFee;
    uint tokenAmountMantissa = ethToSend / presaleAddress[presaleid].price;

    // create pairs
    // send eth to the pair
    // send the token of tokenAmount from  the user to the pair
    admin.transfer(usageFee);
    IUniswapV2Router02(router).addLiquidityETH(presaleAddress[presaleid].tokenaddress, tokenAmountMantissa, tokenAmountMantissa, ethToSend, msg.sender, block.timestamp + 20 minutes);

  }

  function changeUsageFee(uint newUsageFee) external{
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only the admin could change usage fee");
    usageFee = newUsageFee;
  }


}