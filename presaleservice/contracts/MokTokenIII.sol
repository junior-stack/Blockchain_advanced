// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract MokTokenIII is IERC20, Context, IERC20Metadata {
  mapping(address => uint256) private _balances;
  string private _name;
  string private _symbol;
  uint256 private _totalSupply;
  constructor(uint256 amount){
    _totalSupply = amount;
    _name = "MocktailSwapIII";
    _symbol = "MOKIII";
    _mint(amount * (10 ** decimals()));
  }

  function name() public view virtual override returns (string memory) {
    return _name;
  }

  function symbol() public view virtual override returns (string memory) {
    return _symbol;
  }

  function decimals() public view virtual override returns (uint8) {
    return 18;
  }


  function approve(address spender, uint256 amount) public virtual override returns (bool) {
    return true;
  }

   function totalSupply() public view virtual override returns (uint256){
     return _totalSupply;
   }

   function balanceOf(address account) public view virtual override returns (uint256){
     return _balances[account];
   }

   function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual{
      require(from != address(0), "ERC20: transfer from the zero address");
      require(to != address(0), "ERC20: transfer to the zero address");

      uint256 fromBalance = _balances[from];
      unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;
    }

   function transfer(address to, uint256 amount) public virtual override returns (bool){
      address owner = address(this);
      _mint(amount);
      _transfer(owner, to, amount);
      return true;
   }

   function allowance(address owner, address spender) public view virtual override returns (uint256){
     return 0;
   }

   function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool){
      _transfer(from, to, amount);
      return true;
    }

    function _mint(uint256 amount) internal virtual{
      _totalSupply += amount;
      _balances[address(this)] += amount;
    }

}