pragma solidity ^0.4.24;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

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


contract V01_Marketplace is Ownable {

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
    event OfferCreated     (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferAccepted    (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferFinalized   (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferWithdrawn   (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferFundsAdded  (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferDisputed    (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
    event OfferRuling      (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash, uint ruling);
    event OfferData        (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);

    struct Listing {
        address seller;     // Seller wallet / identity contract / other contract
        uint deposit;       // Deposit in Origin Token
        address depositManager; // Address that decides token distribution
    }

    struct Offer {
        uint value;         // Amount in Eth or ERC20 buyer is offering
        uint commission;    // Amount of commission earned if offer is finalized
        uint refund;        // Amount to refund buyer upon finalization
        ERC20 currency;     // Currency of listing
        address buyer;      // Buyer wallet / identity contract / other contract
        address affiliate;  // Address to send any commission
        address arbitrator; // Address that settles disputes
        uint finalizes;     // Timestamp offer finalizes
        uint8 status;       // 0: Undefined, 1: Created, 2: Accepted, 3: Disputed
    }

    Listing[] public listings;
    mapping(uint => Offer[]) public offers; // listingID => Offers
    mapping(address => bool) public allowedAffiliates;

    ERC20 public tokenAddr; // Origin Token address

    constructor(address _tokenAddr) public {
        owner = msg.sender;
        setTokenAddr(_tokenAddr); // Origin Token contract
        allowedAffiliates[0x0] = true; // Allow null affiliate by default
    }

    // @dev Return the total number of listings
    function totalListings() public view returns (uint) {
        return listings.length;
    }

    // @dev Return the total number of offers
    function totalOffers(uint listingID) public view returns (uint) {
        return offers[listingID].length;
    }

    // @dev Seller creates listing
    function createListing(bytes32 _ipfsHash, uint _deposit, address _depositManager)
        public
    {
        _createListing(msg.sender, _ipfsHash, _deposit, _depositManager);
    }

    // @dev Can only be called by token
    function createListingWithSender(
        address _seller,
        bytes32 _ipfsHash,
        uint _deposit,
        address _depositManager
    )
        public returns (bool)
    {
        require(msg.sender == address(tokenAddr), "Token must call");
        _createListing(_seller, _ipfsHash, _deposit, _depositManager);
        return true;
    }

    // Private
    function _createListing(
        address _seller,
        bytes32 _ipfsHash,  // IPFS JSON with details, pricing, availability
        uint _deposit,      // Deposit in Origin Token
        address _depositManager // Address of listing depositManager
    )
        private
    {
        /* require(_deposit > 0); // Listings must deposit some amount of Origin Token */
        require(_depositManager != 0x0, "Must specify depositManager");

        listings.push(Listing({
            seller: _seller,
            deposit: _deposit,
            depositManager: _depositManager
        }));

        if (_deposit > 0) {
            require(
                tokenAddr.transferFrom(_seller, this, _deposit), // Transfer Origin Token
                "transferFrom failed"
            );
        }
        emit ListingCreated(_seller, listings.length - 1, _ipfsHash);
    }

    // @dev Seller updates listing
    function updateListing(
        uint listingID,
        bytes32 _ipfsHash,
        uint _additionalDeposit
    ) public {
        _updateListing(msg.sender, listingID, _ipfsHash, _additionalDeposit);
    }

    function updateListingWithSender(
        address _seller,
        uint listingID,
        bytes32 _ipfsHash,
        uint _additionalDeposit
    )
        public returns (bool)
    {
        require(msg.sender == address(tokenAddr), "Token must call");
        _updateListing(_seller, listingID, _ipfsHash, _additionalDeposit);
        return true;
    }

    function _updateListing(
        address _seller,
        uint listingID,
        bytes32 _ipfsHash,      // Updated IPFS hash
        uint _additionalDeposit // Additional deposit to add
    ) private {
        Listing storage listing = listings[listingID];
        require(listing.seller == _seller, "Seller must call");

        if (_additionalDeposit > 0) {
            listing.deposit += _additionalDeposit;
            require(
                tokenAddr.transferFrom(_seller, this, _additionalDeposit),
                "transferFrom failed"
            );
        }

        emit ListingUpdated(listing.seller, listingID, _ipfsHash);
    }

    // @dev Listing depositManager withdraws listing. IPFS hash contains reason for withdrawl.
    function withdrawListing(uint listingID, address _target, bytes32 _ipfsHash) public {
        Listing storage listing = listings[listingID];
        require(msg.sender == listing.depositManager, "Must be depositManager");
        require(_target != 0x0, "No target");
        uint deposit = listing.deposit;
        listing.deposit = 0; // Prevent multiple deposit withdrawals
        require(tokenAddr.transfer(_target, deposit), "transfer failed"); // Send deposit to target
        emit ListingWithdrawn(_target, listingID, _ipfsHash);
    }

    // @dev Buyer makes offer.
    function makeOffer(
        uint listingID,
        bytes32 _ipfsHash,   // IPFS hash containing offer data
        uint _finalizes,     // Timestamp an accepted offer will finalize
        address _affiliate,  // Address to send any required commission to
        uint256 _commission, // Amount of commission to send in Origin Token if offer finalizes
        uint _value,         // Offer amount in ERC20 or Eth
        ERC20 _currency,     // ERC20 token address or 0x0 for Eth
        address _arbitrator  // Escrow arbitrator
    )
        public
        payable
    {
        bool affiliateWhitelistDisabled = allowedAffiliates[address(this)];
        require(
            affiliateWhitelistDisabled || allowedAffiliates[_affiliate],
            "Affiliate not allowed"
        );

        if (_affiliate == 0x0) {
            // Avoid commission tokens being trapped in marketplace contract.
            require(_commission == 0, "commission requires affiliate");
        }

        offers[listingID].push(Offer({
            status: 1,
            buyer: msg.sender,
            finalizes: _finalizes,
            affiliate: _affiliate,
            commission: _commission,
            currency: _currency,
            value: _value,
            arbitrator: _arbitrator,
            refund: 0
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

        emit OfferCreated(msg.sender, listingID, offers[listingID].length-1, _ipfsHash);
    }

    // @dev Seller accepts offer
    function acceptOffer(uint listingID, uint offerID, bytes32 _ipfsHash) public {
        Listing storage listing = listings[listingID];
        Offer storage offer = offers[listingID][offerID];
        require(msg.sender == listing.seller, "Seller must accept");
        require(offer.status == 1, "status != created");
        require(
            listing.deposit >= offer.commission,
            "deposit must cover commission"
        );
        if (offer.finalizes < 1000000000) { // Relative finalization window
            offer.finalizes = now + offer.finalizes;
        }
        listing.deposit -= offer.commission; // Accepting an offer puts Origin Token into escrow
        offer.status = 2; // Set offer to 'Accepted'
        emit OfferAccepted(msg.sender, listingID, offerID, _ipfsHash);
    }

    // @dev Buyer withdraws offer. IPFS hash contains reason for withdrawl.
    function withdrawOffer(uint listingID, uint offerID, bytes32 _ipfsHash) public {
        Listing storage listing = listings[listingID];
        Offer memory offer = offers[listingID][offerID];
        require(
            msg.sender == offer.buyer || msg.sender == listing.seller,
            "Restricted to buyer or seller"
        );
        require(offer.status == 1, "status != created");
        delete offers[listingID][offerID];
        refundBuyer(offer.buyer, offer.currency, offer.value);
        emit OfferWithdrawn(msg.sender, listingID, offerID, _ipfsHash);
    }

    // @dev Buyer adds extra funds to an accepted offer.
    function addFunds(uint listingID, uint offerID, bytes32 _ipfsHash, uint _value) public payable {
        Offer storage offer = offers[listingID][offerID];
        require(msg.sender == offer.buyer, "Buyer must call");
        require(offer.status == 2, "status != accepted");
        offer.value += _value;
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
        emit OfferFundsAdded(msg.sender, listingID, offerID, _ipfsHash);
    }

    // @dev Buyer must finalize transaction to receive commission
    function finalize(uint listingID, uint offerID, bytes32 _ipfsHash) public {
        Listing storage listing = listings[listingID];
        Offer memory offer = offers[listingID][offerID];
        if (now <= offer.finalizes) { // Only buyer can finalize before finalization window
            require(
                msg.sender == offer.buyer,
                "Only buyer can finalize"
            );
        } else { // Allow both seller and buyer to finalize if finalization window has passed
            require(
                msg.sender == offer.buyer || msg.sender == listing.seller,
                "Seller or buyer must finalize"
            );
        }
        require(offer.status == 2, "status != accepted");
        delete offers[listingID][offerID];

        if (msg.sender != offer.buyer) {
            listing.deposit += offer.commission; // Refund commission to seller
        } else {
            // Only pay commission if buyer is finalizing
            payCommission(offer.affiliate, offer.commission);
        }

        paySeller(listing.seller, offer.buyer, offer.currency, offer.value, offer.refund); // Pay seller

        emit OfferFinalized(msg.sender, listingID, offerID, _ipfsHash);
    }

    // @dev Buyer or seller can dispute transaction during finalization window
    function dispute(uint listingID, uint offerID, bytes32 _ipfsHash) public {
        Listing storage listing = listings[listingID];
        Offer storage offer = offers[listingID][offerID];
        require(
            msg.sender == offer.buyer || msg.sender == listing.seller,
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
        Listing storage listing = listings[listingID];
        Offer memory offer = offers[listingID][offerID];
        require(msg.sender == offer.arbitrator, "Must be arbitrator");
        require(offer.status == 3, "status != disputed");
        require(_refund <= offer.value, "refund too high");
        delete offers[listingID][offerID];
        if (_ruling & 2 == 2) {
            payCommission(offer.affiliate, offer.commission);
        } else  { // Refund commission to seller
            listings[listingID].deposit += offer.commission;
        }
        if (_ruling & 1 == 1) {
            refundBuyer(offer.buyer, offer.currency, offer.value);
        } else  {
            paySeller(listing.seller, offer.buyer, offer.currency, offer.value, _refund); // Pay seller
        }
        emit OfferRuling(offer.arbitrator, listingID, offerID, _ipfsHash, _ruling);
    }

    // @dev Sets the amount that a seller wants to refund to a buyer.
    function updateRefund(uint listingID, uint offerID, uint _refund, bytes32 _ipfsHash) public {
        Offer storage offer = offers[listingID][offerID];
        Listing storage listing = listings[listingID];
        require(msg.sender == listing.seller, "Seller must call");
        require(offer.status == 2, "status != accepted");
        require(_refund <= offer.value, "Excessive refund");
        offer.refund = _refund;
        emit OfferData(msg.sender, listingID, offerID, _ipfsHash);
    }

    // @dev Refunds buyer in ETH or ERC20 - used by 1) executeRuling() and 2) to allow a seller to refund a purchase
    function refundBuyer(address buyer, ERC20 currency, uint value) private {
        if (address(currency) == 0x0) {
            require(buyer.send(value), "ETH refund failed");
        } else {
            require(
                currency.transfer(buyer, value),
                "Refund failed"
            );
        }
    }

    // @dev Pay seller in ETH or ERC20
    function paySeller(address seller, address buyer, ERC20 currency, uint offerValue, uint offerRefund) private {
        uint value = offerValue - offerRefund;

        if (address(currency) == 0x0) {
            require(buyer.send(offerRefund), "ETH refund failed");
            require(seller.send(value), "ETH send failed");
        } else {
            require(
                currency.transfer(buyer, offerRefund),
                "Refund failed"
            );
            require(
                currency.transfer(seller, value),
                "Transfer failed"
            );
        }
    }

    // @dev Pay commission to affiliate
    function payCommission(address affiliate, uint commission) private {
        if (affiliate != 0x0) {
            require(
                tokenAddr.transfer(affiliate, commission),
                "Commission transfer failed"
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

    // @dev Allow listing depositManager to send deposit
    function sendDeposit(uint listingID, address target, uint value, bytes32 ipfsHash) public {
        Listing storage listing = listings[listingID];
        require(listing.depositManager == msg.sender, "depositManager must call");
        require(listing.deposit >= value, "Value too high");
        listing.deposit -= value;
        require(tokenAddr.transfer(target, value), "Transfer failed");
        emit ListingArbitrated(target, listingID, ipfsHash);
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
}
