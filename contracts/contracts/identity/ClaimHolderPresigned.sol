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
        bytes _data,
        uint256[] _offsets
    )
        public
    {
        uint offset = 0;
        for (uint8 i = 0; i < _claimType.length; i++) {
            addClaim(
              _claimType[i],
              1,
              _issuer[i],
              getBytes(_signature, (i * 65), 65),
              getBytes(_data, offset, _offsets[i]),
              ""
            );
            offset += _offsets[i];
        }
    }
}
