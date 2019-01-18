---
title: IPFS Schemas
layout: page
category: "The Protocol"
toc: true
---


# Protocol Schemas


## Listing Schema

This describes a listing for purchase on the Origin marketplace.

```javascript
{
    schemaId: "https://schema.originprotocol.com/listing_1.0.0.json",
    dappSchemaId: "https://dapp.originprotocol.com/schemas/forSale-toysGames_1.0.0.json",
    listingType: "unit",
    category: "schema.forSale",
    subCategory: "schema.carsTrucks",
    language: "en-us",
    title: "1997 Lotus Esprit",
    description: "Red. 100K miles. Always garaged.",
    media: [
        {url: "ipfs://Ac92fa25B89D37077C7e52BDae22094f7b864e91"},
        {url: "ipfs://C9a2fa25B89D37045C7e52BDae22094f7b864b82"},
    ],
    price: {amount: "48.7", currency: "ETH"},
    unitsTotal: 1,
    commission: {amount: "500", currency: "OGN"},
    commissionPerUnit: {amount: "500", currency: "OGN"}
}
```

#### Required Fields:

| | |
|----|-----|
|**schemaId** | Must be set to `https://schema.originprotocol.com/listing_1.0.0.json` |
|**dappSchemaId** | Optional. JSON schema used by the DApp to create the listing. |
|**listingType** | Must be set to `unit` |
|**category** | A category/schema key string from the DApp. See possible values [here](https://github.com/OriginProtocol/origin/tree/master/origin-dapp/src/schemaMessages)  |
|**subCategory** | A subcategory key string from a schema in the DApp. See possible values inside each DApp schema [here](https://github.com/OriginProtocol/origin/tree/master/origin-dapp/src/schemaMessages)
|**language** | A single language or locale tag that the listing text is written in. |
|**title** | The short title of the listing |
|**description** | A full textual description of the listing. Linebreaks are currently ignored, though this will change. |
|**price** | For currencies, we support `ETH`, with future plans to support any ERC20 token |
|**unitsTotal** | The number of units available for sale. |

#### Optional Fields

| | |
|----|-----|
|media | A list of media elements to be shown with the listing. We currently only support **images** on the **ipfs://** protocol.|
|commission | This is the total amount, spread across all `unitsTotal` units, the seller is willing to pay the DApp that sells the listing user after the sale is complete. The currency must be `OGN`. This money comes out of the deposit amount the seller puts into the listing. Note that the deposit amount may very well be too low to actually pay the commission - this must be checked for before trusting the commission. This total commission amount should be enough to pay `commissionPerUnit` for each unit available. |
|commissionPerUnit | This is the amount the seller is willing to pay for each unit sold by the DApp that sells the listing user after the sale is complete. The currency must be `OGN`. This money comes out of the deposit amount the seller puts into the listing. Note that the deposit amount may very well be too low to actually pay the commission - this must be checked for before trusting the commission. |


## Offer Schema

An Offer is sent by a buyer to make a purchase from a listing.

```javascript
{
    schemaId: "https://schema.originprotocol.com/offer_1.0.0.json",
    listingType: "unit",
    unitsPurchased: 1,
    totalPrice: {amount: "48.7", currency: "ETH"},
    commission: {amount: "500", currency: "OGN"}
}
```

#### Required Fields:

| | |
|----|-----|
|**schemaId** | Must be set to `https://schema.originprotocol.com/offer_1.0.0.json` |
|**listingType** | Must be set to `unit` |
|**unitsPurchased** | The number of units to purchase. Currently must be `1`. |
|**totalPrice** | The price the buyer is willing to pay. For currencies, we support `ETH`, with future plans to support any ERC20 token. |
|**commission**| **UNSAFE FIELD - this data duplicates, and may not match, the actual blockchain contract amount.** The amount the buyer's DApp will receive for the sale. Must be equal to, or less than, the listing's per-unit commission amount. The currency must be `OGN`. The amount may be zero if there is no listing commission set.|


## Dispute Schema

A dispute can be started by either party. In v1.0.0, this schema contains no useful required fields, and is a placeholder for future expansion. It is intended that the parties and the arbitrator will communicate over Origin Messenger after the dispute process is started.

```javascript
{
    schemaId: "https://schema.originprotocol.com/dispute_1.0.0.json",
}
```

### Required Fields:

| | |
|----|-----|
|**schemaId** | Must be set to `https://schema.originprotocol.com/dispute_1.0.0.json` |


## Listing-Withdraw Schema

In v1.0.0, this schema contains no useful required fields, and is a placeholder for future expansion.

```javascript
{
    schemaId: "https://schema.originprotocol.com/listing-withdraw_1.0.0.json",
}
```

### Required Fields:

| | |
|----|-----|
|**schemaId** | Must be set to `https://schema.originprotocol.com/listing-withdraw_1.0.0.json` |


## Offer-Accept Schema

In v1.0.0, this schema contains no useful required fields, and is a placeholder for future expansion.

```javascript
{
    schemaId: "https://schema.originprotocol.com/offer-accept_1.0.0.json",
}
```

### Required Fields:

| | |
|----|-----|
|**schemaId** | Must be set to `https://schema.originprotocol.com/offer-accept_1.0.0.json` |


## Offer-Withdraw Schema

In v1.0.0, this schema contains no useful required fields, and is a placeholder for future expansion.

```javascript
{
    schemaId: "https://schema.originprotocol.com/offer-withdraw_1.0.0.json",
}
```

### Required Fields:

| | |
|----|-----|
|**schemaId** | Must be set to `https://schema.originprotocol.com/offer-withdraw_1.0.0.json` |


## Profile Schema

A profile allows a user to let the world know a little more about them.

```javascript
{
    schemaId: "https://schema.originprotocol.com/profile_1.0.0.json",
    firstName: "Jake",
    lastName: "Lewis",
    avatar: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
    description: "Marketing Executive in Belfast."
}
```

### Required Fields:

| | |
|----|-----|
|**schemaId** | Must be set to `https://schema.originprotocol.com/profile_1.0.0.json` |
|**firstName** | The user's first name. |
|**lastName** | The user's last name.|

### Optional Fields:

| | |
|----|-----|
|**avatar** | A [data url](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) image for the user's profile image.|
|**description** | A textual description by the user about themselves. |


## Resolution Schema

In v1.0.0, this schema contains no useful required fields, and is a placeholder for future expansion.

```javascript
{
    schemaId: "https://schema.originprotocol.com/resolution_1.0.0.json",
}
```

### Required Fields:

| | |
|----|-----|
|**schemaId** | Must be set to `https://schema.originprotocol.com/resolution_1.0.0.json` |


## Review Schema

A review of a single purchase by either a seller or a buyer.

```javascript
{
    schemaId: "https://schema.originprotocol.com/review_1.0.0.json",
    rating: 5,
    text: "Buyer handled the notary process very quickly."
}
```

### Required Fields:

| | |
|----|-----|
|**schemaId** | Must be set to `https://schema.originprotocol.com/review_1.0.0` |
|**rating** | A number between 1 and 5. May be either an iteger or a decimal. |
|**text** | A textual review. May be a blank string - in which case it should not be shown by UIs. |