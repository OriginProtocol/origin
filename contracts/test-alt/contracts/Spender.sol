pragma solidity ^0.4.24;

import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract Spender {
  ERC20 token;

  // These are read back by the contract tests.
  address public sender;
  bytes32 public storedBytes32;
  bool public storedBool;
  uint8 public storedUint8;
  uint32 public storedUint32;
  uint256 public storedUint256;
  int8 public storedInt8;
  int256 public storedInt256;

  constructor(address _token) public {
    token = ERC20(_token);
  }

  function transferTokens(
    address _sender,
    uint256 amount,
    bytes32 _bytes32,
    bool _bool,
    uint8 _uint8,
    uint32 _uint32,
    uint256 _uint256,
    int8 _int8,
    int256 _int256
  )
    public
    payable
  {
    require(token.transferFrom(_sender, this, amount), "transferFrom failed");
    sender = _sender;
    storedBytes32 = _bytes32;
    storedBool = _bool;
    storedUint8 = _uint8;
    storedUint32 = _uint32;
    storedUint256 = _uint256;
    storedInt8 = _int8;
    storedInt256 = _int256;
  }
}
