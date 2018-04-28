pragma solidity ^0.4.23;

import './ClaimHolder.sol';

/**
 * NOTE: This contract exists as a convenience for deploying an identity with
 * some 'pre-signed' claims. If you don't care about that, just use ClaimHolder
 * instead.
 */

contract ClaimHolderPresigned is ClaimHolder {

    constructor(
        uint256[] _claimType,
        address[] _issuer,
        bytes _signature,
        bytes _data
    )
        public
    {
        for (uint8 i = 0; i < _claimType.length; i++) {
            addClaim(
              _claimType[i],
              1,
              _issuer[i],
              getBytes(_signature, (i * 65), 65),
              getBytes(_data, (i * 32), 32),
              ""
            );
        }
    }

    function getBytes(bytes _str, uint256 _offset, uint256 _length)
        private
        pure
        returns (bytes)
    {
        bytes memory sig = new bytes(_length);
        uint256 j = 0;
        for (uint256 k = _offset; k< _offset + _length; k++) {
          sig[j] = _str[k];
          j++;
        }
        return sig;
    }

    function getString(string _str, uint256 _offset, uint256 _length)
        private
        pure
        returns (string)
    {
        bytes memory strBytes = bytes(_str);
        bytes memory sig = new bytes(_length);
        uint256 j = 0;
        for (uint256 k = _offset; k< _offset + _length; k++) {
          sig[j] = strBytes[k];
          j++;
        }
        return string(sig);
    }
}
