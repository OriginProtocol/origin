pragma solidity ^0.4.24;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title A contract for distributing ERC20 tokens to multiple addresses in a single transaction.
 * */

contract ERC20 {
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool);
}

contract TokenDistributor is Ownable {
    // Whitelist of addresses allowed to make a transfer.
    mapping (address => bool) public allowedTransactors;

    function addTransactor(address _transactor) public onlyOwner {
        allowedTransactors[_transactor] = true;
    }

    function removeTransactor(address _transactor) public onlyOwner {
        delete allowedTransactors[_transactor];
    }

    /**
    * @dev Transfer tokens to multiples recipients.
    * @param _tokenAddress The address of the ERC20 token contract.
    * @param _addresses The addresses to transfer to.
    * @param _values The amount to be transferred to each address.
    */
    function transfer(address _tokenAddress, address[] memory _addresses, uint256[] memory _values) public returns (bool) {
        require(allowedTransactors[msg.sender], "Caller not on the transactor whitelist");
        require(_tokenAddress != 0x0, "Invalid _tokenAddress");
        require(_addresses.length == _values.length, "Different length for _addresses and _values");

        for (uint256 i = 0; i < _addresses.length; i++) {
            address to = _addresses[i];
            uint256 value = _values[i];

            require(to != address(0), "Invalid destination address");
            require(value > 0, "Invalid value");

            require(ERC20(_tokenAddress).transferFrom(msg.sender, to, value), "Transfer failed");
        }
        return true;
    }
}