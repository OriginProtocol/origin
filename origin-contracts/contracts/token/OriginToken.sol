pragma solidity ^0.4.24;

import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";

import "./WhitelistedPausableToken.sol";


/**
 * @title Origin token
 * @dev Token that allows minting, burning, and pausing by contract owner
 */
contract OriginToken is BurnableToken, MintableToken, WhitelistedPausableToken, DetailedERC20 {
    event AddCallSpenderWhitelist(address enabler, address spender);
    event RemoveCallSpenderWhitelist(address disabler, address spender);

    mapping (address => bool) public callSpenderWhitelist;

    // @dev Constructor that gives msg.sender all initial tokens.
    constructor(uint256 _initialSupply) DetailedERC20("OriginToken", "OGN", 18) public {
        owner = msg.sender;
        mint(owner, _initialSupply);
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

    //
    // approveAndCall methods
    //

    // @dev Add spender to whitelist of spenders for approveAndCall
    // @param _spender Address to add
    function addCallSpenderWhitelist(address _spender) public onlyOwner {
        callSpenderWhitelist[_spender] = true;
        emit AddCallSpenderWhitelist(msg.sender, _spender);
    }

    // @dev Remove spender from whitelist of spenders for approveAndCall
    // @param _spender Address to remove
    function removeCallSpenderWhitelist(address _spender) public onlyOwner {
        delete callSpenderWhitelist[_spender];
        emit RemoveCallSpenderWhitelist(msg.sender, _spender);
    }

    // @dev Approve transfer of tokens and make a contract call in a single
    // @dev transaction. This allows a DApp to avoid requiring two MetaMask
    // @dev approvals for a single logical action, such as creating a listing,
    // @dev which requires the seller to approve a token transfer and the
    // @dev marketplace contract to transfer tokens from the seller.
    //
    // @dev This is based on the ERC827 function approveAndCall and avoids
    // @dev security issues by only working with a whitelisted set of _spender
    // @dev addresses. The other difference is that the combination of this
    // @dev function ensures that the proxied function call receives the
    // @dev msg.sender for this function as its first parameter.
    //
    // @param _spender The address that will spend the funds.
    // @param _value The amount of tokens to be spent.
    // @param _selector Function selector for function to be called.
    // @param _callParams Packed, encoded parameters, omitting the first parameter which is always msg.sender
    function approveAndCallWithSender(
        address _spender,
        uint256 _value,
        bytes4 _selector,
        bytes _callParams
    )
        public
        payable
        returns (bool)
    {
        require(_spender != address(this), "token contract can't be approved");
        require(callSpenderWhitelist[_spender], "spender not in whitelist");

        require(super.approve(_spender, _value), "approve failed");

        bytes memory callData = abi.encodePacked(_selector, uint256(msg.sender), _callParams);
        // solium-disable-next-line security/no-call-value
        require(_spender.call.value(msg.value)(callData), "proxied call failed");
        return true;
    }
}
