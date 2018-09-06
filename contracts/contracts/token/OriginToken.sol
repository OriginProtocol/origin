pragma solidity ^0.4.24;

import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

import "./WhitelistedPausableToken.sol";

/**
 * @title Origin token
 * @dev Token that allows minting, burning, and pausing by contract owner
 */
contract OriginToken is BurnableToken, MintableToken, WhitelistedPausableToken {
  string public constant name = "OriginToken"; // solium-disable-line uppercase
  string public constant symbol = "OGN"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase

  // @dev Constructor that gives msg.sender all initial tokens.
  constructor(uint256 initialSupply) public {
    owner = msg.sender;
    mint(owner, initialSupply);
  }

  //
  // Burn methods
  //

  // @dev Burns tokens belonging to the sender
  // @param _value Amount of token to be burned
  function burn(uint256 _value) public onlyOwner {
    // TODO: add a function & modifier to enable for all accounts without doing
    // a contract migration?
    super.burn(_value);
  }

  // @dev Burns tokens belonging to the specified address
  // @param _who The account whose tokens we're burning
  // @param _value Amount of token to be burned
  function burn(address _who, uint256 _value) public onlyOwner {
    _burn(_who, _value);
  }
}
