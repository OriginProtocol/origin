pragma solidity ^0.4.24;

import "./ERC735.sol";
import "./KeyHolder.sol";
import "./ClaimHolderLibrary.sol";


contract ClaimHolder is KeyHolder, ERC735 {

    ClaimHolderLibrary.Claims claims;

    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes _signature,
        bytes _data,
        string _uri
    )
        public
        returns (bytes32 claimRequestId)
    {
        return ClaimHolderLibrary.addClaim(
            keyHolderData,
            claims,
            _topic,
            _scheme,
            _issuer,
            _signature,
            _data,
            _uri
        );
    }

    function addClaims(
        uint256[] _topic,
        address[] _issuer,
        bytes _signature,
        bytes _data,
        uint256[] _offsets
    )
        public
    {
        ClaimHolderLibrary.addClaims(
            keyHolderData,
            claims,
            _topic,
            _issuer,
            _signature,
            _data,
            _offsets
        );
    }

    function removeClaim(bytes32 _claimId) public returns (bool success) {
        return ClaimHolderLibrary.removeClaim(keyHolderData, claims, _claimId);
    }

    function getClaim(bytes32 _claimId)
        public
        view
        returns(
            uint256 topic,
            uint256 scheme,
            address issuer,
            bytes signature,
            bytes data,
            string uri
        )
    {
        return ClaimHolderLibrary.getClaim(claims, _claimId);
    }

    function getClaimIdsByTopic(uint256 _topic)
        public
        view
        returns(bytes32[] claimIds)
    {
        return claims.byTopic[_topic];
    }
}
