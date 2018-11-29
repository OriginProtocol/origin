pragma solidity ^0.4.24;

import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";


/**
 * @title Contract for enforcing a list of addresses allowed to send or receive tokens
 * @dev Until the whitelist expiration expires, this contract only permits
 * token transfers in which an allowed transactor is either the sender or
 * recipient. Once the whitelist expiration passes, it becomes impossible to
 * re-enable the whitelist.
 *
 * This contract inherits from PausableToken to enforce both pausing and
 * whitelists for transfer calls.
 */
contract WhitelistedPausableToken is PausableToken {
    // UNIX timestamp (in seconds) after which this whitelist no longer applies
    uint256 public whitelistExpiration;
    // While the whitelist is active, either the sender or recipient must be
    // in allowedTransactors.
    mapping (address => bool) public allowedTransactors;

    event SetWhitelistExpiration(uint256 expiration);
    event AllowedTransactorAdded(address sender);
    event AllowedTransactorRemoved(address sender);

    //
    // Functions for maintaining whitelist
    //

    modifier allowedTransfer(address _from, address _to) {
        require(
            // solium-disable-next-line operator-whitespace
            !whitelistActive() ||
            allowedTransactors[_from] ||
            allowedTransactors[_to],
            "neither sender nor recipient are allowed"
        );
        _;
    }

    function whitelistActive() public view returns (bool) {
        return block.timestamp < whitelistExpiration;
    }

    function addAllowedTransactor(address _transactor) public onlyOwner {
        emit AllowedTransactorAdded(_transactor);
        allowedTransactors[_transactor] = true;
    }

    function removeAllowedTransactor(address _transactor) public onlyOwner {
        emit AllowedTransactorRemoved(_transactor);
        delete allowedTransactors[_transactor];
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
