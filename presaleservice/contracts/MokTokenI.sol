// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MokTokenI is ERC20 {
  constructor(uint256 amount) public ERC20("MokTailI", "MOK"){
    _mint(msg.sender, amount);
  }

  function mint(address to, uint amount) external{
    increaseAllowance(address(this), amount);
    _mint(to, amount);
  }

}