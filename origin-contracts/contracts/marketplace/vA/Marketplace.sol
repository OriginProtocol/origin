pragma solidity ^0.4.24;

import "../../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title A Marketplace contract for managing listings, offers, payments, escrow and arbitration
 * @author Nick Poulden <nick@poulden.com>
 *
 * Listings may be priced in Eth or ERC20.
 */


contract ERC20 {
    function transfer(address _to, uint256 _value) external returns (bool);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
}


contract VA_Marketplace is Ownable {

    /**
    * @notice All events have the same indexed signature offsets for easy filtering
    */
    event MarketplaceData  (address indexed party, bytes32 ipfsHash);
    event AffiliateAdded   (address indexed party, bytes32 ipfsHash);
    event AffiliateRemoved (address indexed party, bytes32 ipfsHash);
    event ListingCreated   (address indexed party, uint indexed listingID, bytes32 ipfsHash);
    event ListingUpdated   (address indexed party, uint indexed listingID, bytes32 ipfsHash);
    event ListingWithdrawn (address indexed party, uint indexed listingID, bytes32 ipfsHash);
    event ListingArbitrated(address indexed party, uint indexed listingID, bytes32 ipfsHash);
    event ListingData      (address indexed party, uint indexed listingID, bytes32 ipfsHash);
    event OfferCreated     (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash, bytes32 listingIpfsHash);
    event OfferAccepted    (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferFinalized   (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferWithdrawn   (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferFundsAdded  (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferDisputed    (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferRuling      (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash, uint ruling);
    event OfferData        (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);

    struct Offer {
        uint value;         // Amount in Eth or ERC20 buyer is offering
        uint refund;        // Amount to refund buyer upon finalization
        uint commission;    // Amount of commission earned if offer is finalized
        ERC20 currency;     // Currency of listing
        address buyer;      // Buyer wallet / identity contract / other contract
        address affiliate;  // Address to send any commission
        address arbitrator; // Address that settles disputes
        uint finalizes;     // Timestamp offer finalizes
        uint8 status;       // 0: Undefined, 1: Created, 2: Accepted, 3: Disputed
        address seller;            // the address of the seller
        address verifier;          // Address whose signature can verify the terms
    }

    mapping(uint => Offer[]) public offers; // listingID => Offers
    mapping(address => bool) public allowedAffiliates;

    uint chainId;

    ERC20 public tokenAddr; // Origin Token address


    bytes32 private constant salt = 0x0000000000000000000000000000000000000000000000000000000000000666;

    string private constant EIP712_DOMAIN  = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
    string private constant ACCEPT_OFFER_TYPE = "AcceptOffer(uint256 listingID,uint256 offerID,bytes32 ipfsHash,uint256 behalfFee)";
    string private constant FINALIZE_TYPE = "Finalize(uint256 listingID,uint256 offerID,bytes32 ipfsHash,uint256 payOut,uint256 behalfFee)";

    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));
    bytes32 private constant ACCEPT_OFFER_TYPEHASH = keccak256(abi.encodePacked(ACCEPT_OFFER_TYPE));
    bytes32 private constant FINALIZE_TYPEHASH = keccak256(abi.encodePacked(FINALIZE_TYPE));

    constructor(address _tokenAddr, uint _chainId) public {
        owner = msg.sender;
        setTokenAddr(_tokenAddr); // Origin Token contract
        allowedAffiliates[0x0] = true; // Allow null affiliate by default
        chainId = _chainId;
    }

    // @dev Return the total number of offers
    function totalOffers(uint listingID) public view returns (uint) {
        return offers[listingID].length;
    }

    // @dev Buyer makes offer.
    function _makeOffer(
        address _buyer,
        uint listingID,
        bytes32 _listingIpfsHash, // listing IPFS hash that we're making an offer on
        bytes32 _ipfsHash,   // IPFS hash containing offer data
        uint _finalizes,     // Timestamp an accepted offer will finalize
        address _affiliate,  // Address to send any required commission to
        uint256 _commission, // Amount of commission to send in Origin Token if offer finalizes
        uint _value,         // Offer amount in ERC20 or Eth
        ERC20 _currency,     // ERC20 token address or 0x0 for Eth
        address _arbitrator,  // Escrow arbitrator
        address _seller,
        address _verifier
    )
        public
        payable
    {
        require(
            allowedAffiliates[address(this)] || allowedAffiliates[_affiliate],
            "Affiliate not allowed"
        );

        if (_affiliate == 0x0) {
            // Avoid commission tokens being trapped in marketplace contract.
            require(_commission == 0, "commission requires affiliate");
        }
        if (_commission > 0) {
            tokenAddr.transferFrom(_buyer, this, _commission); // Transfer Origin Token
        }

        offers[listingID].push(Offer({
            status: 1,
            buyer: _buyer,
            finalizes: _finalizes,
            affiliate: _affiliate,
            commission: _commission,
            currency: _currency,
            value: _value,
            arbitrator: _arbitrator,
            refund: 0,
            seller: _seller,
            verifier: _verifier
        }));

        if (address(_currency) == 0x0) { // Listing is in ETH
            require(msg.value == _value, "ETH value doesn't match offer");
        } else { // Listing is in ERC20
            require(msg.value == 0, "ETH would be lost");
            require(
                _currency.transferFrom(msg.sender, this, _value),
                "transferFrom failed"
            );
        }

        emit OfferCreated(_buyer, listingID, offers[listingID].length-1, _ipfsHash, _listingIpfsHash);
    }

    function makeOffer(
        uint listingID,
        bytes32 _listingIpfsHash, // listing IPFS hash that we're making an offer on
        bytes32 _ipfsHash,   // IPFS hash containing offer data
        uint _finalizes,     // Timestamp an accepted offer will finalize
        address _affiliate,  // Address to send any required commission to
        uint256 _commission, // Amount of commission to send in Origin Token if offer finalizes
        uint _value,         // Offer amount in ERC20 or Eth
        ERC20 _currency,     // ERC20 token address or 0x0 for Eth
        address _arbitrator,  // Escrow arbitrator
        address _seller,
        address _verifier
    )
        public
        payable
    {
        _makeOffer(msg.sender, listingID, _listingIpfsHash, _ipfsHash, _finalizes, _affiliate, _commission, _value, _currency, _arbitrator, _seller, _verifier);
    }

    // @dev Make new offer after withdraw
    function makeOffer(
        uint listingID,
        bytes32 _listingIpfsHash,
        bytes32 _ipfsHash,
        uint _finalizes,
        address _affiliate,
        uint256 _commission,
        uint _value,
        ERC20 _currency,
        address _arbitrator,
        address _seller,
        address _verifier,
        uint _withdrawOfferID
    )
        public
        payable
    {
        withdrawOffer(listingID, _withdrawOfferID, _ipfsHash);
        makeOffer(listingID, _listingIpfsHash, _ipfsHash, _finalizes,  _affiliate, _commission, _value, _currency, _arbitrator, _seller, _verifier);
    }

    function makeOfferWithSender(
        address _buyer,
        uint listingID,
        bytes32 _listingIpfsHash,
        bytes32 _ipfsHash,
        uint _finalizes,
        address _affiliate,
        uint256 _commission,
        uint _value,
        ERC20 _currency,
        address _arbitrator,
        address _seller,
        address _verifier
    )
        public payable returns (bool)
    {
        require(msg.sender == address(tokenAddr), "Token must call");
        _makeOffer(_buyer, listingID, _listingIpfsHash, _ipfsHash, _finalizes, _affiliate, _commission, _value, _currency, _arbitrator, _seller, _verifier);
        return true;
    }

    function hashDomain() internal view returns (bytes32)
    {
        return keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256("Origin Protocol"),
                keccak256("1"),
                chainId,
                address(this),
                salt
        ));
    }

    function hashAcceptOffer(uint listingID, uint offerID, bytes32 ipfsHash, uint behalfFee) internal view returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                hashDomain(),
                keccak256(
                    abi.encode(
                        ACCEPT_OFFER_TYPEHASH,
                        listingID,
                        offerID,
                        ipfsHash,
                        behalfFee))
        ));
    }

    function hashFinalize(uint listingID, uint offerID, bytes32 ipfsHash, uint payOut, uint behalfFee) internal view returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                hashDomain(),
                keccak256(
                    abi.encode(
                        FINALIZE_TYPEHASH,
                        listingID,
                        offerID,
                        ipfsHash,
                        payOut,
                        behalfFee))
        ));
    }

    function acceptOfferOnBehalf(uint listingID, uint offerID, bytes32 _ipfsHash, uint _behalfFee, address seller, uint8 v, bytes32 r, bytes32 s) public 
    {
        // Either the seller or a buyer generated offer must accept
        require(ecrecover(hashAcceptOffer(listingID, offerID, _ipfsHash, _behalfFee), v, r, s) == seller, "The offer acceptance signature does not match the seller");
        Offer storage offer = offers[listingID][offerID];
        require(offer.seller == seller || (offer.seller == address(0) && offer.buyer == msg.sender), "The listing must belong to either the sender or the behalf of sender.");
        require(offer.value > _behalfFee, "There is not enough value to pay off the behalf fee");
        offer.value -= _behalfFee;
        require(msg.sender.send(_behalfFee), "Cannot send fee to sender");
        if (offer.seller != seller) {
            offer.seller = seller;
        }
        require(offer.status == 1, "status != created");
        if (offer.finalizes < 1000000000) { // Relative finalization window
            offer.finalizes = now + offer.finalizes;
        }
        offer.status = 2; // Set offer to 'Accepted'
        emit OfferAccepted(seller, listingID, offerID, _ipfsHash);
    }


    // @dev Seller accepts offer
    function acceptOffer(uint listingID, uint offerID, bytes32 _ipfsHash) public 
    {
        Offer storage offer = offers[listingID][offerID];
        require(offer.seller == msg.sender, "The listing must belong to the sender.");
        require(offer.status == 1, "status != created");
        if (offer.finalizes < 1000000000) { // Relative finalization window
            offer.finalizes = now + offer.finalizes;
        }
        offer.status = 2; // Set offer to 'Accepted'
        emit OfferAccepted(msg.sender, listingID, offerID, _ipfsHash);
    }

    // @dev Buyer withdraws offer. IPFS hash contains reason for withdrawl.
    function withdrawOffer(uint listingID, uint offerID, bytes32 _ipfsHash) public {
        Offer storage offer = offers[listingID][offerID];
        require(
            msg.sender == offer.buyer,
            "Restricted to buyer"
        );
        require(offer.status == 1, "status != created");
        refundBuyer(listingID, offerID);
        if (offer.commission > 0)
        {
            refundCommission(listingID, offerID);
        }
        emit OfferWithdrawn(msg.sender, listingID, offerID, _ipfsHash);
        delete offers[listingID][offerID];
    }

    // @dev Buyer adds extra funds to an accepted offer.
    function addFunds(uint listingID, uint offerID, bytes32 _ipfsHash, uint _value) public payable {
        Offer storage offer = offers[listingID][offerID];
        require(msg.sender == offer.buyer, "Buyer must call");
        require(offer.status == 2, "status != accepted");
        if (address(offer.currency) == 0x0) { // Listing is in ETH
            require(
                msg.value == _value,
                "sent != offered value"
            );
        } else { // Listing is in ERC20
            require(msg.value == 0, "ETH must not be sent");
            require(
                offer.currency.transferFrom(msg.sender, this, _value),
                "transferFrom failed"
            );
        }
        offer.value += _value;
        emit OfferFundsAdded(msg.sender, listingID, offerID, _ipfsHash);
    }

    // @dev verifier finalize transaction to receive commission
    function _verifiedFinalize(uint listingID, uint offerID, bytes32 _ipfsHash, uint _behalfFee, uint _verifyFee, uint payOut, uint8 v, bytes32 r, bytes32 s) internal 
    {

        Offer storage offer = offers[listingID][offerID];
        // Verifier will not take into account behalfFee
        require(ecrecover(hashFinalize(listingID, offerID, _ipfsHash, payOut, _verifyFee), v, r, s) == offer.verifier, "The finalize signature does not match the verifier");

        require(offer.status == 2, "status != accepted");
        require((offer.value - offer.refund) >= payOut, "Offer cannot make payout");
        require(payOut > (_behalfFee + _verifyFee), "Cannot pay off fees");
        uint actualPayOut = payOut;
        if (_behalfFee > 0) {
            offer.value -= _behalfFee;
            actualPayOut -= _behalfFee;
            require(msg.sender.send(_behalfFee), "Cannot send behalf fee to sender");
        }
        if (_verifyFee > 0) {
            offer.value -= _verifyFee;
            actualPayOut -= _verifyFee;
            require(offer.verifier.send(_verifyFee), "Cannot send verify fee to verifier");
        }
        offer.refund = offer.value - actualPayOut;
        paySeller(listingID, offerID); // Pay seller
        payCommission(listingID, offerID);
        emit OfferFinalized(offer.verifier, listingID, offerID, _ipfsHash);
        delete offers[listingID][offerID];
    }

    function verifiedFinalize(uint listingID, uint offerID, bytes32 _ipfsHash, uint verifyFee, uint payOut, uint8 v, bytes32 r, bytes32 s) public 
    {
        require(offers[listingID][offerID].seller == msg.sender, "Only the seller can verify finalize this transaction.");
        _verifiedFinalize(listingID, offerID, _ipfsHash, 0, verifyFee, payOut, v, r, s);
    }

    function verifiedOnBehalfFinalize(uint listingID, uint offerID, bytes32 _ipfsHash, uint behalfFee, uint verifyFee, uint payOut, uint8 v_seller, bytes32 r_seller, bytes32 s_seller, uint8 v, bytes32 r, bytes32 s) public 
    {
        require(payOut > behalfFee, "Payout must be more than the behalf fee");
        require(ecrecover(hashFinalize(listingID, offerID, _ipfsHash, payOut, behalfFee), v_seller, r_seller, s_seller) == offers[listingID][offerID].seller, "The behalf finalize signature does not match the seller");
        _verifiedFinalize(listingID, offerID, _ipfsHash, behalfFee, verifyFee, payOut, v, r, s);
    }

    // @dev Buyer must finalize transaction to receive commission
    function finalize(uint listingID, uint offerID, bytes32 _ipfsHash) public {
        Offer storage offer = offers[listingID][offerID];
        if (now <= offer.finalizes) { // Only buyer can finalize before finalization window
            require(
                msg.sender == offer.buyer,
                "Only buyer can finalize"
            );
        } else { // Allow both seller and buyer to finalize if finalization window has passed
            require(
                msg.sender == offer.buyer || msg.sender == offer.seller,
                "Seller or buyer must finalize"
            );
        }
        require(offer.status == 2, "status != accepted");
        paySeller(listingID, offerID); // Pay seller
        payCommission(listingID, offerID);
        emit OfferFinalized(msg.sender, listingID, offerID, _ipfsHash);
        delete offers[listingID][offerID];
    }

    // @dev Buyer or seller can dispute transaction during finalization window
    function dispute(uint listingID, uint offerID, bytes32 _ipfsHash) public {
        Offer storage offer = offers[listingID][offerID];
        require(
            msg.sender == offer.buyer || msg.sender == offer.seller,
            "Must be seller or buyer"
        );
        require(offer.status == 2, "status != accepted");
        require(now <= offer.finalizes, "Already finalized");
        offer.status = 3; // Set status to "Disputed"
        emit OfferDisputed(msg.sender, listingID, offerID, _ipfsHash);
    }

    // @dev Called by arbitrator
    function executeRuling(
        uint listingID,
        uint offerID,
        bytes32 _ipfsHash,
        uint _ruling, // 0: Seller, 1: Buyer, 2: Com + Seller, 3: Com + Buyer
        uint _refund
    ) public {
        Offer storage offer = offers[listingID][offerID];
        require(msg.sender == offer.arbitrator, "Must be arbitrator");
        require(offer.status == 3, "status != disputed");
        require(_refund <= offer.value, "refund too high");
        offer.refund = _refund;
        if (_ruling & 1 == 1) {
            refundBuyer(listingID, offerID);
        } else  {
            paySeller(listingID, offerID);
        }
        if (_ruling & 2 == 2) {
            payCommission(listingID, offerID);
        } else  { // Refund commission to seller
            refundCommission(listingID, offerID);
        }
        emit OfferRuling(offer.arbitrator, listingID, offerID, _ipfsHash, _ruling);
        delete offers[listingID][offerID];
    }

    // @dev Sets the amount that a seller wants to refund to a buyer.
    function updateRefund(uint listingID, uint offerID, uint _refund, bytes32 _ipfsHash) public {
        Offer storage offer = offers[listingID][offerID];
        require(msg.sender == offer.seller, "Seller must call");
        require(offer.status == 2, "status != accepted");
        require(_refund <= offer.value, "Excessive refund");
        offer.refund = _refund;
        emit OfferData(msg.sender, listingID, offerID, _ipfsHash);
    }

    // @dev Refunds buyer in ETH or ERC20 - used by 1) executeRuling() and 2) to allow a seller to refund a purchase
    function refundBuyer(uint listingID, uint offerID) private {
        Offer storage offer = offers[listingID][offerID];
        if (address(offer.currency) == 0x0) {
            require(offer.buyer.send(offer.value), "ETH refund failed");
        } else {
            require(
                offer.currency.transfer(offer.buyer, offer.value),
                "Refund failed"
            );
        }
    }

    // @dev Pay seller in ETH or ERC20
    function paySeller(uint listingID, uint offerID) private {
        Offer storage offer = offers[listingID][offerID];
        uint value = offer.value - offer.refund;

        if (address(offer.currency) == 0x0) {
            require(offer.buyer.send(offer.refund), "ETH refund failed");
            require(offer.seller.send(value), "ETH send failed");
        } else {
            require(
                offer.currency.transfer(offer.buyer, offer.refund),
                "Refund failed"
            );
            require(
                offer.currency.transfer(offer.seller, value),
                "Transfer failed"
            );
        }
    }


    // @dev Associate ipfs data with the marketplace
    function addData(bytes32 ipfsHash) public {
        emit MarketplaceData(msg.sender, ipfsHash);
    }

    // @dev Associate ipfs data with a listing
    function addData(uint listingID, bytes32 ipfsHash) public {
        emit ListingData(msg.sender, listingID, ipfsHash);
    }

    // @dev Associate ipfs data with an offer
    function addData(uint listingID, uint offerID, bytes32 ipfsHash) public {
        emit OfferData(msg.sender, listingID, offerID, ipfsHash);
    }

    // @dev Set the address of the Origin token contract
    function setTokenAddr(address _tokenAddr) public onlyOwner {
        tokenAddr = ERC20(_tokenAddr);
    }

    // @dev Add affiliate to whitelist. Set to address(this) to disable.
    function addAffiliate(address _affiliate, bytes32 ipfsHash) public onlyOwner {
        allowedAffiliates[_affiliate] = true;
        emit AffiliateAdded(_affiliate, ipfsHash);
    }

    // @dev Remove affiliate from whitelist.
    function removeAffiliate(address _affiliate, bytes32 ipfsHash) public onlyOwner {
        delete allowedAffiliates[_affiliate];
        emit AffiliateRemoved(_affiliate, ipfsHash);
    }

    function createListings(address[] sellers, uint[] listingIds, bytes32[] ipfsHashes)
    public
    {
        bool affiliateWhitelistDisabled = allowedAffiliates[address(this)];
        require(
            affiliateWhitelistDisabled || allowedAffiliates[msg.sender],
            "Affiliate not allowed"
        );
        require(sellers.length == listingIds.length, "Listings length and sellers length does not match");
        require(sellers.length == ipfsHashes.length, "Hashes length and sellers length does not match");

        for (uint i = 0; i < sellers.length; i++) {
            emit ListingCreated(sellers[i], listingIds[i], ipfsHashes[i]);
        }
    }

    function updateListings(address[] sellers, uint[] listingIds, bytes32[] ipfsHashes)
    public
    {
        bool affiliateWhitelistDisabled = allowedAffiliates[address(this)];
        require(
            affiliateWhitelistDisabled || allowedAffiliates[msg.sender],
            "Affiliate not allowed"
        );
        require(sellers.length == listingIds.length, "Listings length and sellers length does not match");
        require(sellers.length == ipfsHashes.length, "Hashes length and sellers length does not match");

        for (uint i = 0; i < sellers.length; i++) {
            emit ListingUpdated(sellers[i], listingIds[i], ipfsHashes[i]);
        }
    }

    function withdrawListings(address[] sellers, uint[] listingIds, bytes32[] ipfsHashes)
    public
    {
        bool affiliateWhitelistDisabled = allowedAffiliates[address(this)];
        require(
            affiliateWhitelistDisabled || allowedAffiliates[msg.sender],
            "Affiliate not allowed"
        );
        require(sellers.length == listingIds.length, "Listings length and sellers length does not match");
        require(sellers.length == ipfsHashes.length, "Hashes length and sellers length does not match");

        for (uint i = 0; i < sellers.length; i++) {
            emit ListingWithdrawn(sellers[i], listingIds[i], ipfsHashes[i]);
        }
    }

    // @dev Pay commission to affiliate
    function payCommission(uint listingID, uint offerID) private {
        Offer storage offer = offers[listingID][offerID];
        if (offer.affiliate != 0x0) {
            require(
                tokenAddr.transfer(offer.affiliate, offer.commission),
                "Commission transfer failed"
            );
        }
    }

    function refundCommission(uint listingID, uint offerID) private {
        Offer storage offer = offers[listingID][offerID];
        require(
            tokenAddr.transfer(offer.buyer, offer.commission),
            "Commission refund failed"
        );
    }
}
