//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract PresaleService is AccessControl{
  using Counters for Counters.Counter;
  Counters.Counter presaleId;
  uint public usageFee;
  address public immutable override WETH;
  address public immutable override router;
  address public admin;

  struct presaleInfo{
    uint start;
    uint end;
    uint price;
    uint amount;
    uint weth;
    bool ended;
    address tokenaddress;
  }
  mapping(uint => presaleInfo) public presaleAddress;

  constructor(uint initialusageFee, address initialadmin, address _WETH, address _router){
    usageFee = initialusageFee;
    WETH = _WETH;
    _setupRole(DEFAULT_ADMIN_ROLE, initialadmin);
    adin = initialadmin;
    router = _router;
  }

  function startPresale(uint[] memory start, uint[] memory end, uint[] memory price, uint[] memory tokenAmounts, ERC20[] memory tokenAddress) external{
    require(start.length == end.length, "the entered inputs should have the same length");
    require(start.length == price.length);
    require(start.length == tokenAmounts.length);
    require(start.length == tokenAddress.length);
    for(uint i; i < start.length; i++){
      presaleAddress[presaleId.current()] = presaleInfo(start[i], end[i], price[i], amount[i], tokenAddress[i]);
      tokenAddress.transfer(address(this), tokenAddress[i].balanceOf(msg.sender));
      presaleId.increment();
    }
  }

  function buy(uint presaleId, uint amountMantissa) external{
    require(block.timestamp >= presaleAddress[presaleId], "the current time has not passed the start time of this presale");
    require(block.timestamp <= presaleAddres[presaleId], "the current time has passed the end time of this presale");

    uint wethAmount = presaleAddress[presaleId].price * amountMantissa;
    presaleAddress[presaleId].weth = wethAmount;
    IERC20(WETH).transferFrom(msg.sender, address(this), wethAmount);
    IERC20(presaleAddress[presaleId].tokenaddress).transfer(msg.sender, amountMantissa);
    
  }

  function withdraw(uint presaleId) external{
    require(presaleAddress[presaleId].ended, "This presale has not been ended");
    IERC20(presaleAddress[presaleId].tokenaddress).transfer(msg.sender, IERC(presaleAddress[presaleId].tokenaddress).balanceOf(address(this)));
  }

  function endPresale(uint presaleId) external{
    require(block.timestamp > presaleAddress[presaleId].end, "The end timestamp has not been passed yet");
    presaleAddress[presaleId].ended = true;
    uint adminfee = presaleAddress[presaleId].weth - usageFee;
    uint tokenAmountMantissa = adminfee / presaleAddress[presaleId].price;

    // create pairs
    // send eth to the pair
    // send the token of tokenAmount from  the user to the pair
    IERC20(WETH).transferFrom(address(this), admin, ussageFee);
    IUniswapV2Router02(router).addLiquidityETH(presaleAddress[presaleId].tokenaddress, tokenAmountMantissa, tokenAmountMantissa, adminfee, msg.sender, block.timestamp);

  }

  function changeUsageFee(uint newUsageFee) external{
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only the admin could change usage fee");
    usageFee = newUsageFee;
  }


}