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
