---
layout: page
title: Architecture
nav_weight: 2010
category: "Overview"
---

# Architecture

If you're new to the space, it may be helpful to first familiarize yourself with some of the core technologies that we're using to build Origin, such as [JSONSchema](#jsonschema), [IPFS](#ipfs) and [Ethereum](#ethereum).

Origin listings can be created using a frontend DApp to publish a JSON data object to
any publicly writeable IPFS gateway. This JSON data object must conform to a set of
standards and validation rules to be considered valid on the network. Users can
optionally sign their listings cryptographically to verify their identity using
publicly auditable proofs or trusted third parties. The IPFS gateway will publish the
listing to the IPFS network making the listing instantly available via hundreds of
distributed computers around the world to anyone who knows the content hash. The
content hash of the listing is then sent to a smart contract which formally publishes
the listing and stores pricing and availability information along with any specified
booking rules and policies.

Listings can easily be searched, browsed, and booked via a frontend DApp. Since we
anticipate having too many listings to reasonably parse in a browser, the frontend
DApp connects to an open-source bridge server of the user’s choosing, making it
possible to search and filter the entire public corpus of listings. Once a listing has
been selected, a user can make a booking by sending payment to the booking smart
contract along with the IPFS hash of the chosen listing and the desired interval to
book. The smart contract will verify that the booking is valid and handle the transfer
of tokens between the buyer and the seller, including the escrow of funds when
applicable.

We anticipate most sellers will prefer to list their prices in fiat currencies which
often have less volatility than digital currencies. To solve this challenge, both the
booking smart contract and the bridge servers will use a common set of oracles and a
shared algorithm to determine the exchange rate to be used. This allows prices to be
shown to end users in their preferred fiat currencies while the correct amount of
digital tokens are sent during the booking. A diverse set of oracles will be chosen to
avoid introducing single points of failure into the system.

Sellers are responsible for disclosing their preferred messaging channels in their
listings through which buyers can contact them before, during, or after a transaction.
Buyers can similarly indicate their preferred messaging channels when they complete a
booking. Non-transactional communication between buyers and sellers will occur
off-chain, and both parties are encouraged to only use secure and verifiable
communication channels. For transactions that have a possibility of needing
arbitration, a multisignature messaging channel should be chosen that includes the
arbitrator in all communications.

Once a transaction is complete, users are encouraged via economic incentives to leave
feedback about the interaction in the form of a rating or review. Once again, the
content is stored on IPFS and only the content hash is stored on Ethereum. Users are
able to establish their reputations over time with verified transactions, building a
unified reputation across multiple listing verticals. Buyers can use different wallets
with varying levels of identity attached for sensitive transactions, or choose to only
reveal their true identity to the seller while using a throw-away wallet.

Listing policies around escrow, refunds, required deposits, and cancellations are set
by the seller and are strictly enforced by the booking smart contract. Any exceptions
to the policies must be handled directly off-chain by the two parties.

### JSONSchema

[Learn more about JSONSchema](http://json-schema.org/)

### Ethereum

[Learn more about Ethereum](https://ethereum.org/)

### IPFS

[Learn more about IPFS](https://github.com/ipfs)


# Platform Components

Origin.js provides the interface for developers to interact with the rest of the Origin platform, all without writing Solidity code or managing IPFS instances.

At a high-level, the Origin platform consists of user, listing, and booking data and logic stored on the decentralized tech stack. Mission-critical data and logic such as booking availability, transaction history, and escrow rules are generally stored on chain in a series of Ethereum smart contracts. Related metadata such as listing descriptions and images are stored on IPFS, with pointers to this data in the form of content hashes being stored on chain.

### User Registry

The Origin user registry is a datastore of all Origin-enabled users. Origin users are identified by their Ethereum wallet addresses. In addition, the user registry also stores a mapping of all forms of identity verification that the user has successfully undertaken.

Origin.js enables developers to register users to the shared user registry, as well as query for identity verifications.

### Listing Registry

The listing registry stores all valid Origin listings, from cars for rent to freelance design services. Developers will be able to create new listings in JSON, then push them to the Origin listing registry. Under the covers, Origin.js handles the creation of new IPFS content files for static metadata and new entries to the Origin listing registry smart contract.

Note that Origin.js does not support browsing and searching the listing registry directly. It is recommended that developers use our open-source bridge server to efficiently query the blockchain.

### Booking Contracts

Booking contracts are automatically created when buyers book listings on Origin-powered DApps. These individual smart contract instances are generated and deployed with rules around price, reservation time, and payment rules. For certain listing types, Origin.js will also generate additional contract code for arbitration, escrow, deposits, payment schedules, etc.

### Contract Modularity

Origin smart contracts are designed to be flexible and modular. We recognize the need for developers and entrepreneurs to have a choice in selecting smart contract components that tailor-serve their needs.

To that end, we will provide default contracts for escrow, arbitration, and insurance that will be inherited by our booking smart contracts. However, developers will be able to specify alternative contracts of their choosing (either their own or approved third-party contracts) in Origin.js function calls to generate custom booking contracts.