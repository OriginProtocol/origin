---
title: API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - html
  - css
  - javascript
  - json

toc_footers:
  - <a href='http://www.originprotocol.com'>Return to the Origin homepage</a>
  - <a href='https://github.com/lord/slate'>Documentation Powered by Slate</a>

includes:
  - errors

search: true
---

# Introduction

Origin.js enables the creation of decentralized marketplaces that allow buyers and sellers to find each other and transact without requiring any trusted intermediaries.

We're motivated by a deep desire to eliminate rent-seeking middlemen, reduce censorship, maximize personal liberty, and to give early participants in the community a stake in the network.

This API documentation will explain how you can use the origin.js library to create your own decentralized marketplace using [IPFS](https://github.com/ipfs) and the [Ethereum network](https://https://www.ethereum.org/).

Please note, this project is still in heavy development and many of the features described below have not been implemented yet. This library should not be considered as production-ready.

Origin.js and the entire Origin Protocol project is 100% Open Source and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve and grow our community.

If you are interested in getting involved, please read our section on [contributing](#contributing). If at any point you get stuck, please [reach out](#getting-help) and we'll do our best to help. 

# Getting started

### Install Metamask

Install the [Metamask Chrome Browser Extension](https://metamask.io/). This will enable you to connect to the Ethereum network from your browser. Metamask allows you to run Ethereum dApps right in your browser without running a full Ethereum node. Metamask is required for saving any changes to Origin objects to the network.

### Acquire Test ETH

Our smart contracts are currently deployed on the `Rinkeby testnet`. You will need to have test ETH to use this library. You can request test funds from the [Rinkeby faucet](https://faucet.rinkeby.io/). Do not yet send real ETH on the Origin network. Use Rinkeby testnet ETH instead.

<aside class="notice">
Do not send real ETH on the Origin network. Use Rinkeby testnet ETH instead.
</aside>

### Hello World

> Sample app

```html
<html>
<title>Hello World</title>
<body>
  <script type="text/javascript" src="origin.js"></script>
</body>
</html>
```

```javascript
var origin = new Origin();

var user = new User();
user.name = "Joe"

var listing = new Listing();
listing.owner = user

listing.save()

```

# Authentication & Identity

## Identity verification

Users identities are tied to Ethereum addresses and your private keys are used as the sole method of authentication on the Origin platform.

Users can always prove ownership of a wallet without sending funds, simply by signing a message using their private keys.

Users can assume multiple identities by creating multiple wallets. In this manner, users can choose how much of their  off-line identities they wish to reveal to other users while participating on the Origin network.

Origin allows users to identify themselves using [publicly auditable proofs](#publicly-auditable-proofs) and attestations from [trusted third-parties](#trusted-third-parties).

<aside class="notice">
Make sure to safely store your private keys. We can't help if you lose them.
</aside>

## Publicly-Auditable Proofs 

A user can choose to identify themselves on other platforms using
publicly auditable proofs. A user can post their public key on
Facebook or Twitter and then cryptographically sign their listing using their
private key. Users can then include links in their listings to the Facebook post,
tweet or website that displays their public key. In this manner, anyone can
independently verify the poster’s identity, or at least confirm that they control
those accounts or domain. Origin.js simplifies this process for users by
making it easy to generate these proofs and verify the proofs of other users.
As people share their identity proofs on Facebook and Twitter, it will help 
create network effects as friends learn about Origin and decide to participate.

## Trusted Third-Parties

Users can also collect verifications from trusted third-parties like
[Civic](https://www.civic.com/), [uPort](https://www.uport.me/) or the Origin Foundation.
These third-party providers can provide identity verification 
that interfaces with the offline world. For example, a third-party identity provider 
may help confirm a physical address by sending a postcard with a special code to that address and then having the user enter that code on a website. Similar methods can be used to confirm control of a phone number or
email address. Trusted third-parties can also verify government IDs like drivers
licenses and passports which are required for certain types of listings like car
rentals.

# Architecture

If you're new to the space, it may be helpful to first familiarize yourself with some of the core technologies that we're using to build Origin, such as [JSONSchema](#jsonschema), [IPFS](#ipfs) and [Ethereum](#ethereum)

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
DApp connects to an open-source indexing server of the user’s choosing, making it
possible to search and filter the entire public corpus of listings. Once a listing has
been selected, a user can make a booking by sending payment to the booking smart
contract along with the IPFS hash of the chosen listing and the desired interval to
book. The smart contract will verify that the booking is valid and handle the transfer
of tokens between the buyer and the seller, including the escrow of funds when
applicable.

We anticipate most sellers will prefer to list their prices in fiat currencies which
often have less volatility than digital currencies. To solve this challenge, both the
booking smart contract and the indexing servers will use a common set of oracles and a
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

## JSONSchema

[Learn more about JSONSchema](http://json-schema.org/)

## Ethereum

[Learn more about Ethereum](https://https://www.ethereum.org/).

## IPFS

[Learn more about IPFS](https://github.com/ipfs).

# Listing Schemas

Since many unrelated developers will be reading and writing to
the same data layer, it is essential that everyone adhere to common standards.
We will publish and maintain the rules for what constitutes a “valid Origin
listing” as well as a library of inheritable JSON schemas for fields commonly
used on listings, such as email addresses, URLs, GPS coordinates, international
street addresses, international phone numbers and other metadata. These schemas
are also easily extensible enabling the creation of new product categories,
support for internationalization or other languages as well as other unforeseen
use-cases.

## Base Schema

Every Origin listing must contain some standard fields in order to be considered valid.

## Example Schemas

Example schemas can be found in the [Schemas repository](https://github.com/OriginProtocol/listing-schemas). These need a lot more work.

## Inheritance

Inherit commonly used fields like:

 - Email Addresses
 - URLs
 - GPS Coordinates
 - International Street Addresses
 - International Phone Numbers
 - Other Metadata

## Extensibility

# Objects

## User

## Listing

## Booking

## Feedback

### Ratings 

1-5 

### Reviews

String

### Comments

String

# Functions

## Browse Listings

## Search Listings

## Create Listing

## Update Listing

## Deactivate Listing

## Book Listing

## Leave Feedback

## Messaging

# Getting help

## Slack

Our team collaboration is done in public and our company Slack is open to all. If you have questions or need help getting started, our Slack channel is a great place to get assistance from our team of engineers and developers.

[Request an invite to join the Origin Protocol Slack](http://slack.originprotocol.com)

Once inside, find us in one of the `eng` channels.

## Email

You can also reach us by email at [support@originprotocol.com](mailto:support@originprotocol.com).

# Contributing

Want to hack on Origin? Awesome! Here are instructions to get you started.
They are not perfect yet. Please let us know what feels wrong or incomplete.

Origin is an Open Source project and we welcome contributions of all sorts.
There are many ways to help, from reporting issues, contributing code, and
helping us improve our community.

### Dive Right In

If you're ready to start hacking on Origin right now and you just need an issue to focus on, check out [this search of all our currently open issues on Github](https://github.com/search?utf8=%E2%9C%93&q=user%3AOriginProtocol+is%3Aopen+&type=Issues).

Read our [community guidelines](#community-guidelines) first and have fun!

### Protocol Design

When considering protocol or implementation design proposals, we are looking for:

- A description of the problem this design proposal solves
- Discussion of the trade-offs involved
- Review of other existing solutions
- Links to relevant literature (RFCs, papers, etc)
- Discussion of the proposed solution

Please note that protocol design is hard, and meticulous work. You may need to review existing literature and think through generalized use cases.

### Community Guidelines

We want to keep the Origin community awesome, growing and collaborative. We need your help to keep it that way. To help with this we've come up with some general guidelines for the community as a whole:

- Be nice: Be courteous, respectful and polite to fellow community members: no regional, racial, gender, or other abuse will be tolerated. We like nice people way better than mean ones!

- Encourage diversity and participation: Make everyone in our community feel welcome, regardless of their background and the extent of their contributions, and do everything possible to encourage participation in our community.

- Keep it legal: Basically, don't get anybody in trouble. Share only content that you own, do not share private or sensitive information, and don't break laws.

- Stay on topic: Make sure that you are posting to the correct channel and avoid off-topic discussions. Remember when you update an issue or respond to an email you are potentially sending to a large number of people. Please consider this before you update. Also remember that nobody likes spam.

### Reporting Issues

If you find bugs, mistakes or inconsistencies in the Origin project's code or
documents, please let us know by filing an issue at the appropriate issue
tracker (we use multiple repositories). 

<aside class="notice">
No issue is too small. Help us fix our tpyos!
</aside>

 - [Docs issues](https://github.com/OriginProtocol/docs/issues)
 - [Origin.js issues](https://github.com/OriginProtocol/origin-js/issues)
 - [Demo Dapp issues](https://github.com/OriginProtocol/demo-dapp/issues)
 - [Company website issues](https://github.com/OriginProtocol/company-website/issues)

### Security Issues

The Origin Protocol and its implementations are still in heavy development. This means that there may be problems in our protocols, or there may be mistakes in our implementations. We take security vulnerabilities very seriously. If you discover a security issue, please bring it to our attention right away!

If you find a vulnerability please send your report privately to [security@originprotocol.com](mailto:security@originprotocol.com) or [contact Josh Fraser via Keybase](https://keybase.io/joshfraser). Please DO NOT file a public issue.

If the issue is a protocol weakness or something not yet deployed, just discuss it openly.

### Community Improvement

Origin is just as much about community as it is about our technology.

We need constant help in improving our documentation, building new tools to interface with our platform, spreading the word to new users, helping new users getting setup and much more.

Please get in touch if you would like to help out. Our `community` channel on [Slack](#slack) is a great place to share ideas and volunteer to help.

### Full Time Positions

Origin occasionally hires developers for part time or full time positions. 

We have a strong preference for hiring people who have already started contributing to the project. If you want a full time position on our team, your best shot is to engage with our team and start contributing code. It is very unlikely that we would offer you a full time position on our engineering team unless you've had at least a couple approved pull requests first. 

If you are interested, check out [the Origin Protocol job listings](https://angel.co/originprotocol/jobs). If you'd like to help in other ways, propose your ideas on the [Origin Slack](#slack).
