pragma solidity ^0.4.24;

import "../../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../../../node_modules/openzeppelin-solidity/contracts/AddressUtils.sol";

/**
 * @title RestrictableContract
 * @author Shahul Hameed <hello@hameid.net>
 *
 * Extends Ownable contract and maintains a whitelist of users and whitelist of contracts
 */

contract RestrictableContract is Ownable {
    mapping(address => bool) public allowedContracts;
    mapping(address => bool) public allowedUsers;

    constructor() public {
        // Set owner to contract creator
        owner = msg.sender;

        // Whitelist self
        allowedContracts[address(this)] = true;
    }

    modifier onlyWhitelistedContracts(address contractAddress) {
        require(allowedContracts[contractAddress], "Contract is not whitelisted");
        _;
    }

    modifier onlyWhitelistedContractsOrOwner(address _address) {
        require(_address == owner || allowedContracts[_address], "Must be a whitelisted contract or owner");
        _;
    }

    modifier onlyWhitelistedUsers(address userAddress) {
        require(allowedUsers[userAddress], "Must be a whitelisted user");
        _;
    }

    modifier onlyWhitelistedUsersOrOwner(address userAddress) {
        require(userAddress == owner || allowedUsers[userAddress], "Must be a whitelisted user or owner");
        _;
    }

    // Add contract address to whitelist
    function whitelistContract(address contractAddress) public onlyOwner {
        require(AddressUtils.isContract(contractAddress), "Must be a contract address");
        allowedContracts[contractAddress] = true;
    }

    // Remove contract address from whitelist
    function blacklistContract(address contractAddress) public onlyOwner {
        require(AddressUtils.isContract(contractAddress), "Must be a contract address");
        allowedContracts[contractAddress] = false;
    }

    // Adds user address to whitelist
    function whitelistUser(address userAddress) public onlyOwner {
        require(!AddressUtils.isContract(userAddress), "Must be an user address");
        allowedUsers[userAddress] = true;
    }

    // Removes user from whitelist
    function blacklistUser(address userAddress) public onlyOwner {
        require(!AddressUtils.isContract(userAddress), "Must be an user address");
        allowedUsers[userAddress] = false;
    }

    // @returns true if contract is whitelisted
    function isContractWhitelisted(address contractAddress) public view returns(bool) {
        return allowedContracts[contractAddress];
    }

    // @returns true if user address is whitelisted
    function isUserWhitelisted(address userAddress) public view returns(bool) {
        return allowedContracts[userAddress];
    }
}
