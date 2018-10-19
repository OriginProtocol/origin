# Marketplace

The marketplace manages listings from creation to sale as well as disputes between users.

## getListings

This will return information about the listing, combining information from IPFS and the blockchain. In the future, fields returned may differ based on the listing's schema.

> Example: getListings

```javascript

> origin.marketplace.getListings({ idsOnly: true })

//returns

['0-34-2-34', '000-234']

> origin.marketplace.getListings({ listingsFor: '0x627306090abab3a6e1400e9345bc60c78a8bef57' })

//returns

[{
  id: "99-0023",
  title: "Kettlebell For Sale",
  media: [],
  schemaId: "09398482-2834",
  unitsTotal: 1,
  type: "unit",
  category: "Health and Beauty",
  subCategory: "daily exercise",
  language: "English",
  description: "32kg gorilla kettlebell",
  price: { currency: 'ETH', amount: '0.5' },
  commission: { currency: 'OGN', amount: '1' },
  ipfsHash: "QmWZDcDq4aYGx9XmkPcx4mnKaGW2jCxf5tknrCtbfpJJFf",
  seller: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
  depositManager: '0x02394099fu9dfse0920394u329u4024',
  status: 'active',
  offers: [], //is this supposed to be an array or an object?
  expiry: '1529674159',
  events:[{ id: '20949-345', event: 'ListingCreated' }]
}]
```

### Arguments:

|Name|Type|Required|Description|
|----|-----|-----|-----|
|**idsOnly** |boolean|optional||
|**listingsFor** | string |optional|user's address|
|**purchasesFor** | string |optional|user's address|

## createListing

When you create a listing, the API will create both the IPFS data and the Listing contract on the blockchain.
When a listing is successfully created, the `createListing` method takes a callback with two arguments:

`confirmationCount` - the number of successfully created listings

`transactionReceipt` - an object with ipfs information about the newly created listing.

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
  schemaId: "http://schema.originprotocol.com/listing_v1.0.0",
  subCategory: "schema.forSale.appliances",
  title: "I am a great appliance listing",
  unitsTotal: 1
}

const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.createListing({ listing }, callback)
```

### Arguments:

|Name|Type|Required|Description|
|----|-----|-----|-----|
|**listing** |object|required|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## withdrawListing

Withdrawing a transaction will set the `unitsAvailable` to zero. This will stop any further purchases of that Listing.
When a listing is successfully created, the `withdrawListing` method takes a callback with two arguments:

`confirmationCount` - the number of successfully created listings

`transactionReceipt` - an object with ipfs information about the newly created listing.

> Example: withdrawListing

```javascript

const listingId = "927-832"
const ipfsBites = {}
const callback = (confirmationCount, transactionReceipt) => {
  //manage response
}

> origin.marketplace.withdrawListing(listingId, ipfsBites, callback)
```

### Arguments:

|Name|Type|Required|Description|
|----|-----|-----|-----|
|**listingId** |string|required|id of the listing to be withdrawn|
|**ipfsBites**|object|optional|default to `{}` if not needed|
|**callback** | function |optional|provides args `confirmationCount` and `transactionReceipt`|

## getListingReviews

Reviews are created by the buyer in the receipt stage and by the seller in the payout stage of the purchase process. A review consists of a required 1-5 rating and an optional reviewText text field.

> Example: withdrawListing

```javascript

const listingId = "927-832"

> origin.marketplace.getListingReviews(listingId)

//returns

[{
  "schemaId": "http://schema.originprotocol.com/review_v1.0.0",
  "rating": 4,
  "text": "Solid Listing"
  "reviewer": "0x29884972398479234792"
]}
```

### Arguments:

|Name|Type|Required|Description|
|----|-----|-----|-----|
|**listingId** |string|required|id of the listing|

## getNotifications

Each Notification corresponds to a state change of a Purchase. Notifications are currently generated for each of the following purchase stages:

- seller_listing_purchased
- seller_review_received
- buyer_listing_shipped

Notifications do not exist on the blockchain nor are they read from a database. They are derived from the blockchain transaction logs of purchases at the time of the API request. Because of this, there is no central record of a notification's status as "read" or "unread". When a client first interacts with the notifications API, Origin.js will record a timestamp in local storage. All notifications resulting from blockchain events that happen prior to this timestamp will be considered to be "read". This ensures that when the same user interacts with the notifications API from a different client for the first time, they will not receive a large number of "unread" notifications that they have previously read from their original client.

> Example: getNotifications

```javascript

> origin.marketplace.getNotifications()

//returns

[{
  "id": "2984803-23433",
  "type": "buyer_listing_shipped",
  "status": "unread",
  "event": {},
  "resources": { listingId: "927-832", offerId: "183", listing: { title: "Whirlpool Microwave" } }
]}
```
