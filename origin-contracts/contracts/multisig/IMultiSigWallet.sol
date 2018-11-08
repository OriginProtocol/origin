pragma solidity ^0.4.24;


/**
 * @title Interface for interacting with Gnosis MultiSigWallet.
 * @dev Avoids creating an explicit dependency on Gnosis MultiSigWallet, which
 * doesn't have an official npm package. This allows us to just use the ABI
 * to call the contract methods. The contract is deployed through the DApp &
 * desktop app, so we only need to make limited calls to it. Further signatures
 * also happen in the Gnosis apps.
 */
contract IMultiSigWallet {
    mapping (address => bool) public isOwner;
    uint public required;

    /// @dev Allows an owner to submit and confirm a transaction.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @return Returns transaction ID.
    function submitTransaction(address destination, uint value, bytes data)
        public
        returns (uint transactionId);
}
