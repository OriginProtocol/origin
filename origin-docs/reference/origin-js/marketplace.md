---
title: Marketplace
layout: page
category: Origin.js
nav_weight: 90
toc: true
---


The marketplace manages listings from creation to sale as well as disputes between users.

## .getListings

This will return information about the listings for a given user, combining information from IPFS and the blockchain. In the future, fields returned may differ based on the listing's schema.

A listing is a published action from a seller to sell something.
It is active until there are no more units available or its expiration date is reached.

> Example: getListings

```javascript

> origin.marketplace.getListings({ idsOnly: true })

//returns

['0-34-2-34', '000-234']

> origin.marketplace.getListings({ listingsFor: '0x627306090abab3a6e1400e9345bc60c78a8bef57' })

//returns all listings for '0x627306090abab3a6e1400e9345bc60c78a8bef57'

[{
  id: "99-0023",
  title: "Kettlebell For Sale",
  media: [],
  schemaId: "09398482-2834",
  unitsTotal: 1,
  type: "unit",
  category: "healthAndBeauty",
  subCategory: "dailyExercise",
  language: "English",
  description: "32kg gorilla kettlebell",
  price: { currency: 'ETH', amount: '0.5' },
  commission: { currency: 'OGN', amount: '1' },
  ipfsHash: "QmWZDcDq4aYGx9XmkPcx4mnKaGW2jCxf5tknrCtbfpJJFf",
  seller: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
  depositManager: '0x02394099fu9dfse0920394u329u4024',
  status: 'active',
  offers: [], //is this supposed to be an array or an object?
  events:[{ id: '20949-345', event: 'ListingCreated' }]
}]
```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**idsOnly** |boolean|optional||
|**listingsFor** | string |optional|user's address|
|**purchasesFor** | string |optional|user's address|

## .createListing

When you create a listing, the API will create both the IPFS data and the Listing contract on the blockchain.
When a listing is successfully created, the `createListing` method takes a callback with two arguments:

`confirmationCount` - the number of block confirmations

`transactionReceipt` - an object with a timestamp and information about the transaction and the corresponding block

> Example: createListing

```javascript

const listing = {
  category: "schema.forSale",
  commission: { amount: "0", currency: "OGN" },
  description: "ojwoifj weofijfoijfewoi qfoiqejqoidjq oidwjqdo",
  language: "en-US",
  listingType: "unit",
  media: [{…}],
  price: { amount: "0.01", currency: "ETH" },
  schemaId: "https://schema.originprotocol.com/listing_1.0.0.json",
  subCategory: "schema.appliances",
  title: "I am a great appliance listing",
  unitsTotal: 1
}

const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.createListing({ listing }, callback)
```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**listing** |object|required|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## .withdrawListing

Withdrawing a transaction will set the `unitsAvailable` to zero. This will stop any further offers for that Listing.
When a listing is successfully withdrawn, the `withdrawListing` method takes a callback with two arguments:

`confirmationCount` - the number of block confirmations

`transactionReceipt` - an object with a timestamp and information about the transaction and the corresponding block

> Example: withdrawListing

```javascript

const listingId = "927-832"
const data = {}
const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.withdrawListing(listingId, data, callback)
```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**listingId** |string|required|id of the listing to be withdrawn|
|**data**|object|optional|default to `{}` if not needed|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## .getListingReviews

Reviews are created by the buyer in the receipt stage and by the seller in the payout stage of the offer process. A review consists of a required 1-5 rating and an optional reviewText text field.

> Example: withdrawListing

```javascript

const listingId = "927-832"

> origin.marketplace.getListingReviews(listingId)

//returns

[{
  "schemaId": "https://schema.originprotocol.com/review_1.0.0.json",
  "rating": 4,
  "text": "Solid Listing"
  "reviewer": "0x29884972398479234792"
]}
```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**listingId** |string|required|id of the listing|

## .getNotifications

Each Notification corresponds to the status of an Offer. Notifications are currently generated for each of the following Offer statuses:

- OfferCreated
- OfferAccepted
- OfferWithdrawn
- OfferDisputed
- OfferRuling
- OfferFinalized
- OfferData

Notifications do not exist on the blockchain nor are they read from a database. They are derived from the blockchain transaction logs of the Offer statuses at the time of the API request. Because of this, there is no central record of a notification's status as "read" or "unread". When a client first interacts with the notifications API, Origin.js will record a timestamp in local storage. All notifications resulting from blockchain events that happen prior to this timestamp will be considered to be "read". This ensures that when the same user interacts with the notifications API from a different client for the first time, they will not receive a large number of "unread" notifications that they have previously read from their original client.

> Example: getNotifications

```javascript

> origin.marketplace.getNotifications()

//returns all notifications for the user

[{
  "id": "2984803-23433",
  "type": "buyer_offer_accepted",
  "status": "unread",
  "event": {...},
  "resources": {
    listingId: "1-000-832",
    offerId: "183",
    listing: { title: "Whirlpool Microwave" },
    offer: {...}
  }
]}
```

## .setNotification

Since notification objects do not live on the blockchain or in a database, this method only records an update to the client's local storage. It accepts a single parameter, which should be an object containing the id of the notification and a status value of either read or unread. Any other properties included in this object will be ignored.

> Example: setNotification

```javascript

const id = "2984803-23433"
const status = "read"

> origin.marketplace.setNotification({ id, status })

```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**id** |string|required|id of the notification|
|**status** |string|required|`read` or `unread`|


## .getOffer

This will return a specific offer sent by a buyer for a Listing.

An Offer is a single transaction between a buyer and seller. A single Listing with multiple items for sale could have many Offers related to it, one for each buyer.

A new Offer contract is created when a buyer purchases a Listing.

> Example: getOffer

```javascript

const offerId = "2403-234"

> origin.marketplace.getOffer(offerId)

//returns the specified offer

{
  id: "2403-234",
  listingId: "999-000-0",
  status: "accepted",
  createdAt: 1539991086,
  buyer: "0x627306090274fwfiou97h0c78a8BEf57",
  events: [...],
  refund: "0",
  schemaId: "https://schema.originprotocol.com/offer_1.0.0.json",
  listingType: "unit",
  unitsPurchased: 1,
  totalPrice: { currency: "ETH", amount: "0.033" },
  ipfs: {...}
}
```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**offerId** |string|required|id of the offer|

## .getOffers

This will return all offers related to a specific Listing.


> Example: getOffers

```javascript

const listingId = "9903-75"
const options = {
  for: "0x627306090274fwfiou97h0c78a8BEf57"
}

> origin.marketplace.getOffers(listingId, options)

//returns all offers for the specified listing

[{
  id: "999-000-0-0",
  listingId: "9903-75",
  status: "created",
  createdAt: 1539991086,
  buyer: "0x627306090274fwfiou97h0c78a8BEf57",
  events: [...],
  refund: "0",
  schemaId: "https://schema.originprotocol.com/offer_1.0.0.json",
  listingType: "unit",
  unitsPurchased: 1,
  totalPrice: { currency: "ETH", amount: "0.033" },
  ipfs: {...}
},
{
  id: "82838-247-3-3",
  listingId: "9903-75",
  status: "created",
  buyer: "0x938828348ske02heo92394hwf",
  ...
}]
```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**listingId** |string|required|`listing.id`|
|**options** |object|optional|`const options = { for: "0x627..." }`|

## .makeOffer

The `makeOffer` method takes a callback with two arguments:

`confirmationCount` - the number of block confirmations

`transactionReceipt` - an object with a timestamp and information about the transaction and the corresponding block

> Example: makeOffer

```javascript

const listingId = "9903-75"
const offer = {
  id: "82838-247-3-3",
  listingId: "9903-75",
  status: "created",
  buyer: "0x938828348ske02heo92394hwf",
  ...
}
const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.makeOffer(listingId, offer, callback)

```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**listingId** |string|required|`listing.id`|
|**offer** |object|required|args see Protocol Schemas: Offer Schema|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## .acceptOffer

The `acceptOffer` method takes a callback with two arguments:

`confirmationCount` - the number of block confirmations

`transactionReceipt` - an object with a timestamp and information about the transaction and the corresponding block

> Example: acceptOffer

```javascript

const offerId = "543-0099"
const data = {}
const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.acceptOffer(offerId, data, callback)

```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**offerId** |string|required|`offer.id`|
|**data**|object|optional|default to `{}` if not needed|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## .finalizeOffer

The `finalizeOffer` method takes a callback with two arguments:

`confirmationCount` - the number of block confirmations

`transactionReceipt` - an object with a timestamp and information about the transaction and the corresponding block

> Example: finalizeOffer

```javascript

const offerId = "9903-75"
const buyerReview = {
  rating: 5
  schemaId: "https://schema.originprotocol.com/review_1.0.0.json"
  text: "Great response times. Professional."
}
const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.finalizeOffer(offerId, buyerReview, callback)

```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**offerId** |string|required|`offer.id`|
|**buyerReview** |object|required|args `rating`, `schemaId`, `text`|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## .withdrawOffer

The `withdrawOffer` method takes a callback with two arguments:

`confirmationCount` - the number of block confirmations

`transactionReceipt` - an object with a timestamp and information about the transaction and the corresponding block

> Example: withdrawOffer

```javascript

const offerId = "543-0099"
const data = {}
const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.withdrawOffer(offerId, data, callback)

// returns the offer with a OfferWithdrawn event

{
  offerId: "543-0099",
  events: { OfferWithdrawn: {...} }
  ...
}
```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**offerId** |string|required|`offer.id`|
|**data**|object|optional|default to `{}` if not needed|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## .addData

The `addData` method takes a callback with two arguments:

`confirmationCount` - the number of block confirmations

`transactionReceipt` - an object with a timestamp and information about the transaction and the corresponding block

> Example: addData

```javascript

const offerId = "543-0099"
const listingId = "9900-234"
const sellerReview = {
  rating: 4
  schemaId: "https://schema.originprotocol.com/review_1.0.0.json"
  text: ""
}
const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.addData(listingId, offerId, sellerReview, callback)

// returns a timestamp and transaction receipt

{
  timestamp: 1540221215
  events: { OfferWithdrawn: {...} }
  ...
}
```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**listingId** |string|optional|can be `null`|
|**offerId** |string|optional|can be `null`|
|**sellerReview**|object|optional|default to `{}` if not needed|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## .initiateDispute

The `initiateDispute` method takes a callback with two arguments:

`confirmationCount` - the number of block confirmations

`transactionReceipt` - an object with a timestamp and information about the transaction and the corresponding block

> Example: initiateDispute

```javascript

const offerId = "543-0099"
const data = {}
const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.initiateDispute(offerId, data, callback)

// returns a timestamp and transaction receipt

{
  timestamp: 1540221215
  events: { OfferDisputed: {...} }
  ...
}

```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**offerId** |string|required||
|**data**|object|optional|default to `{}` if not needed|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## .resolveDispute

The `resolveDispute` method takes a callback with two arguments:

`confirmationCount` - the number of block confirmations

`transactionReceipt` - an object with a timestamp and information about the transaction and the corresponding block

> Example: resolveDispute

```javascript

const offerId = "543-0099"
const data = {}
const ruling = 1
const refund = 33000000000000000
const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.resolveDispute(offerId, data, ruling, refund, callback)

// returns a timestamp and transaction receipt

{
  timestamp: 1540221215
  events: { OfferRuling: {...} }
  ...
}

```

#### Arguments:

||Type|Required|Description|
|----|-----|-----|-----|
|**offerId** |string|required||
|**data**|object|required|default to `{}` if not needed|
|**ruling**|number|required|`0` or `1`|
|**refund**|object|required|price in `wei`|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|
