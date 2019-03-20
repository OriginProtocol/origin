
![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

## Origin Contracts

This repo contains the Solidity contracts powering the Origin Protocol, consisting of:

**OGN Token**
Origin Token is built on the ERC20 standard, inheriting from Open Zeppelin contracts with a few customizations.

**Marketplace**
The marketplace contract facilitates transactions between buyers and sellers. It supports escrow, arbitration and transactions in Eth and ERC20 tokens, as well as incorporating a commission model and staking in OGN.

**Identity**
The identity contract uses simple event-sourced updates and deletions. We are currently phasing out ERC725 identity contracts.

### Marketplace in depth

#### Actors

The marketplace contract facilitates transactions between **buyers** and **sellers**. Disputes are managed by **arbitrators**. Origin token staked by sellers are controlled by **deposit managers**. Commission can be earned by **affiliates** for connecting buyers with sellers. The marketplace contract itself is managed by its **owner**.

#### Basic Flow

1. Seller submits a listing
2. Buyer makes an offer by sending funds (Eth or ERC20)
3. Seller accepts the offer
4. Buyer confirms receipt, releasing funds to the seller

The corresponding calls in the contract would be:

1. `createListing(bytes32 _ipfsHash)`
2. `makeOffer(uint listingID, bytes32 _ipfsHash, uint _value)`
3. `acceptOffer(uint listingID, uint offerID, bytes32 _ipfsHash)`
4. `finalize(uint listingID, uint offerID, bytes32 _ipfsHash)`

The actual methods are more complicated but these are the core parameters. You'll notice that each step has an IPFS hash which should point to a JSON object with details such as:

1. `createListing:` Title, description, price, available units, images, etc
2. `makeOffer:` Quantity, shipping preferences, etc
3. `acceptOffer:` Expected delivery date, etc
4. `finalize:` Rating and review of seller

The contents of the JSON stored in IPFS will vary by listing type. A simple "for sale" listing may contain the title, description and price. A home share listing could contain location, price per night, availability, number of bedrooms etc. The IPFS JSON is, of course, intended to be consumed off-chain.

####  Flow of funds

The buyer submits either Eth or ERC20 when calling the `makeOffer` method. Once an offer has been made, there are three possible transitions: buyer withdraws, seller declines, or seller accepts. The first two will result in the buyer being refunded. If the seller accepts, the funds are held in escrow. From here, the buyer can either finalize the transaction, or initiate a dispute.

#### Finalization

If the buyer finalizes a transaction, the funds held in escrow are transferred to the seller and the transaction is considered complete. But what happens if the buyer does not finalize? This is where the _finalization window_ comes in. Essentially, the finalization window is a period of time during which the buyer can initiate a dispute. If the finalization window passes, the seller is able to withdraw their funds themselves. This mechanism ensures there is a way for sellers to get paid if the buyer becomes unresponsive, while allowing a reasonable amount of time for the buyer to initiate a dispute if there is a problem.

The length of the finalization window is specified as part of the `makeOffer` call and will be dependent on the type of listing the buyer is making an offer on. An offer on an item for sale might have a finalization window of 10 days, which would allow the buyer time to initiate a dispute if the goods do not arrive. An offer on a home share listing may have a finalization window of 1 day after checkout, for example.

####  Disputes

If the buyer calls `dispute`, the transaction is sent to arbitration. Once a transaction is in this state, the _arbitrator_ controls who the funds are awarded to: buyer, seller, or some combination (eg 90% to seller and 10% to buyer). by calling `executeRuling`. The arbitrator is also specified as part of the `makeOffer` call.

####  Commission

The marketplace has a built in commission model, allowing third party affiliates to profit from connecting buyers with sellers. This mechanism provides an incentive for third parties to build marketplaces on top of Origin. Commission is priced in OGN. When a seller creates a listing, they indicate how much commission they are willing to pay to third parties in return for finding a buyer for their listing. Once a buyer finalizes a transaction, the affiliate is paid their commission. For example:

1. Seller creates a listing with a bike for sale, with a commission of 10 OGN by calling `createListing`. OGN is transferred from the seller to the marketplace and held in escrow.
2. A buyer sees the bike on BlockBikes.com, an affiliate site built on Origin Protocol
3. The buyer makes an offer via the affiliate site. The affiliate site calls `makeOffer` with their affiliate wallet address and desired commission amount specified as parameters.
4. The seller agrees to the offered price and commission by calling `acceptOffer`. Their listing must have enough OGN deposited in order for this call to succeed.
5. The buyer receives their bike and calls `finalize`. The seller receives their funds and the affiliate receives their commission in OGN.

Note that commissions are optional.

#### Partial Refunds

A seller is able to call `updateRefund` on an accepted offer to specify how much Eth or ERC20 the buyer should receive back upon finalization. This is useful if, for example, the buyer complains to the seller that the goods they received are damaged in some way. Rather than going to arbitration the seller can specify a partial refund which the buyer will receive when they call `finalize`.

#### Increasing an offer after acceptance

A convenience method `addFunds` exists so that the buyer can add additional funds to their offer after it has been accepted by the seller. This could be useful if, for example, the buyer wishes to extend their stay at a home share for an extra night. In this case they can simply add additional funds instead of creating a separate offer.

#### Events

Every call which alters the blockchain state will result in an event being emitted. So that these events can be filtered efficiently, they all follow the same signature:

`event EventName (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);`

Here are some example events:

```
event ListingCreated (address indexed party, uint indexed listingID, bytes32 ipfsHash);
event ListingUpdated (address indexed party, uint indexed listingID, bytes32 ipfsHash);
event OfferCreated   (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
event OfferAccepted  (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
event OfferFinalized (address indexed party, uint indexed listingID, uint indexed offerID, bytes32 ipfsHash);
```

Since the parameters are all specified in the same order, events can be filtered by topics efficiently. For example, to find all events related to listing 42, we can call `Marketplace.getLogs('*', '*', '42', '*', '*')`. To get all ListingCreated events we can call `Marketplace.getLogs('ListingCreated', '*', '*', '*')`. To get all events related to a particular party we can call `Marketplace.getLogs('*', '0xPartyWallet', '*', '*')`.

## Running tests

### Command line

Our Solidity tests (which use [Truffle](http://truffleframework.com/docs/getting_started/javascript-tests)) are located at `contracts/test`.

```
npm run test:contracts
```

Note: you should *not* have the server running at this time, as these tests start their own local blockchain instance.

To run contract tests and automatically re-run when files change:

```
npm run test:watch
```

To run contract tests and measure test coverage of Solidity code:

```
npm run test:contracts-coverage
```
