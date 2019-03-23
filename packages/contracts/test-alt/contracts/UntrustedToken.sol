pragma solidity ^0.4.24;

import '../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract UntrustedToken is StandardToken {
  string public name;
  string public symbol;
  uint8 public decimals;

  constructor(string _name, string _symbol, uint8 _decimals, uint _supply) public {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
    totalSupply_ = _supply;
    balances[msg.sender] = _supply;
  }
}
