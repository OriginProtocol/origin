// Taken from https://gist.github.com/GNSPS/ba7b88565c947cfd781d44cf469c2ddb

pragma solidity ^0.4.24;

/* solhint-disable no-inline-assembly, indent, state-visibility, avoid-low-level-calls */

contract ProxyFactory {
    event ProxyDeployed(address proxyAddress, address targetAddress);

    function createProxy(address _target, bytes _data)
        external
        returns (address proxyContract)
    {
        proxyContract = createProxyImpl(_target, _data);
        emit ProxyDeployed(proxyContract, _target);
    }

    function createProxyImpl(address _target, bytes _data)
        internal
        returns (address proxyContract)
    {
        assembly {
            let contractCode := mload(0x40) // Find empty storage location using "free memory pointer"

            mstore(add(contractCode, 0x0b), _target) // Add target address, with a 11 bytes [i.e. 23 - (32 - 20)] offset to later accomodate first part of the bytecode
            mstore(sub(contractCode, 0x09), 0x000000000000000000603160008181600b9039f3600080808080368092803773) // First part of the bytecode, shifted left by 9 bytes, overwrites left padding of target address
            mstore(add(contractCode, 0x2b), 0x5af43d828181803e808314602f57f35bfd000000000000000000000000000000) // Final part of bytecode, offset by 43 bytes

            proxyContract := create(0, contractCode, 60) // total length 60 bytes
            if iszero(extcodesize(proxyContract)) {
                revert(0, 0)
            }

            // check if the _data.length > 0 and if it is forward it to the newly created contract
            let dataLength := mload(_data)
            if iszero(iszero(dataLength)) {
                if iszero(call(gas, proxyContract, 0, add(_data, 0x20), dataLength, 0, 0)) {
                    revert(0, 0)
                }
            }
        }
    }
}
