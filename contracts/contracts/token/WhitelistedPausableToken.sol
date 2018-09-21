pragma solidity ^0.4.24;

import "../../../node_modules/openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";


/**
 * @title Contract for enforcing allowed token sender and recipients
 * @dev Until the whitelist expiration expires, this contract only permits
 * token transfers that involve an allowed sender or allowed recipient. Once the
 * whitelist expiration passes, it becomes impossible to re-enable the
 * whitelist.
 *
 * This contract inherits from PausableToken to enforce both pausing and
 * whitelists for transfer calls.
 */
contract WhitelistedPausableToken is PausableToken {
    // UNIX timestamp (in seconds) after which this whitelist no longer applies
    uint256 public whitelistExpiration;
    // May send tokens to any recipient
    mapping (address => bool) public allowedSenders;
    // May receive tokens from any sender
    mapping (address => bool) public allowedRecipients;

    event SetWhitelistExpiration(uint256 expiration);
    event AllowedSenderAdded(address sender);
    event AllowedSenderRemoved(address sender);
    event AllowedRecipientAdded(address recipient);
    event AllowedRecipientRemoved(address recipient);

    //
    // Functions for maintaining whitelist
    //

    modifier allowedTransfer(address _from, address _to) {
        require(!whitelistActive() || allowedSenders[_from] || allowedRecipients[_to], "neither sender nor recipient are allowed");
        _;
    }

    function whitelistActive() public view returns (bool) {
        return block.timestamp < whitelistExpiration;
    }

    function addAllowedSender(address _sender) public onlyOwner {
        emit AllowedSenderAdded(_sender);
        allowedSenders[_sender] = true;
    }

    function removeAllowedSender(address _sender) public onlyOwner {
        emit AllowedSenderRemoved(_sender);
        delete allowedSenders[_sender];
    }

    function addAllowedRecipient(address _recipient) public onlyOwner {
        emit AllowedRecipientAdded(_recipient);
        allowedRecipients[_recipient] = true;
    }

    function removeAllowedRecipient(address _recipient) public onlyOwner {
        emit AllowedRecipientRemoved(_recipient);
        delete allowedRecipients[_recipient];
    }

    /**
    * @dev Set the whitelist expiration, after which the whitelist no longer
    * applies.
    */
    function setWhitelistExpiration(uint256 _expiration) public onlyOwner {
        // allow only if whitelist expiration hasn't yet been set, or if the
        // whitelist expiration hasn't passed yet
        require(
            whitelistExpiration == 0 || whitelistActive(),
            "an expired whitelist cannot be extended"
        );
        // prevent possible mistakes in calling this function
        require(
            _expiration >= block.timestamp + 1 days,
            "whitelist expiration not far enough into the future"
        );
        emit SetWhitelistExpiration(_expiration);
        whitelistExpiration = _expiration;
    }

    //
    // ERC20 transfer functions that have been overridden to enforce the
    // whitelist.
    //

    function transfer(
        address _to,
        uint256 _value
    )
        public
        allowedTransfer(msg.sender, _to)
        returns (bool)
    {
        return super.transfer(_to, _value);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
    public
        allowedTransfer(_from, _to)
    returns (bool)
    {
        return super.transferFrom(_from, _to, _value);
    }
}
