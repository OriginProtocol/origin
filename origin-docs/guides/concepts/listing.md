---
layout: page
title: Listing
nav_weight: 1100
category: "Concepts"
toc: true
---

A Listing is an offer from a seller to sell, rent, announce, or exchange something. Active listings can be searched and browsed in Origin DApps.

## Event Sourcing

The current state of a particular listing is built up from the actions that have modified it. For example:

- Alice creates a listing for a selling two tickets to a local hockey game.
- Bob offers to buy one ticket
- Alice accepts Bob's offer. Now the current state of the listing is one ticket available for sale.

The blockchain provides an absolute ordered list of events that happened on it (block number and transaction index). This allows everyone to apply events in the same order, so everyone can calculate the same state for the listing.  In case of a conflict, everyone can agree which offers are valid and which are not. For example:

- Alice creates a listing renting an apartment for two weeks.
- Bob offers to rent the first week.
- Alice accepts Bob's offer.
- Mallory offers to rent both weeks. Mallory's offer is treated as invalid because it conflicts with a previously accepted offer. Mallory can withdraw her offer and her ETH at any time.


## Creating a Listing

A listing’s initial data is posted to IPFS as JSON ([listing schema](../../reference/protocol/schemas.md#listing-schema)). A blockchain transaction [createListing](../../reference/origin-js/marketplace.html#createlisting) is then sent to the marketplace contract to announce the listing to the world.

## Withdrawing a Listing

Sending the blockchain transaction [withdrawListing](../../reference/origin-js/marketplace.html#withdrawlisting) marks a listing as no longer able to be purchased.