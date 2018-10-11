# Listing

A listing is an offer from a seller to sell something.

It is active until there are no more units available or its expiration date is reached.

## get

> To get a listing by address

```javascript
const listingAddress = "0x061b8d5f9e432e6b23d79fac02e5792eb8746ce5"
const listing = await origin.listings.get(listingAddress)
// Returns
{
  name: "Kettlebell For Sale",
  category: "Health and Beauty",
  description: "32kg gorilla kettlebell",
  location: "San Francisco, CA",
  pictures: [],

  address: "0x061b8d5f9e432e6b23d79fac02e5792eb8746ce5",
  ipfsHash: "QmWZDcDq4aYGx9XmkPcx4mnKaGW2jCxf5tknrCtbfpJJFf",
  sellerAddress: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
  priceWei: "1000000000000000000",
  price: 1,  // deprecated
  unitsAvailable: 1,
  created: 1524490159,
  expiration: 1529674159,
}
```

This will return information about the listing, combining information from IPFS and the blockchain. In the future, fields returned may differ based on the listing's schema.

<p data-height="440" data-theme-id="33880" data-slug-hash="vrzqYo" data-default-tab="js,result" data-user="originprotocol" data-embed-version="2" data-pen-title="Origin.js: Get Listing" class="codepen">See the Pen <a href="https://codepen.io/originprotocol/pen/vrzqYo/">Origin.js: Get Listing</a> by Origin Protocol (<a href="https://codepen.io/originprotocol">@originprotocol</a>) on <a href="https://codepen.io">CodePen</a>.</p>

## getByIndex

> To get a listing by index position

```javascript
const listing = await origin.listings.getByIndex(1)
// Returns
{
  name: "Kettlebell For Sale",
  category: "Health and Beauty",
  description: "32kg gorilla kettlebell",
  location: "San Francisco, CA",
  pictures: [],

  address: "659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63",
  index: 1,
  ipfsHash: "QmWZDcDq4aYGx9XmkPcx4mnKaGW2jCxf5tknrCtbfpJJFf",
  sellerAddress: "0f62d96d6675f32685bbdb8ac13cda7c23436f63efbb9d07700d8669ff12b7c4",
  price: 0.004,
  unitsAvailable: 1
}
```

**This method is deprecated**, and will be removed soon.  Use `get` instead.

This will return information about the listing, combining information from IPFS and the blockchain. In the future, fields returned may differ based on the listing's schema.

<p data-height="420" data-theme-id="33880" data-slug-hash="VdGJwO" data-default-tab="js,result" data-user="originprotocol" data-embed-version="2" data-pen-title="Origin.js: Get Listing By Index" class="codepen">See the Pen <a href="https://codepen.io/originprotocol/pen/VdGJwO/">Origin.js: Get Listing By Index</a> by Origin Protocol (<a href="https://codepen.io/originprotocol">@originprotocol</a>) on <a href="https://codepen.io">CodePen</a>.</p>

## create

> To create a listing

```javascript
const listingData = {
  name: "Kettlebell For Sale",
  category: "Health and Beauty",
  location: "San Francisco, CA",
  description:
    "32kg gorilla kettlebell",
  pictures: [],
  price: 3.3
}
const schema = "for-sale"
const transaction = await origin.listings.create(listingData, schema)
await origin.contractService.waitTransactionFinished(transaction.tx)
```

When you create a listing, the API will create both the IPFS data and the Listing contract on the blockchain.

The fields used come from the listing schema definition used.

The wallet used to create the listing is used as the seller.

A listing will expire 60 days after its expiration date.

<p data-height="780" data-theme-id="33880" data-slug-hash="oyPrNV" data-default-tab="js,result" data-user="originprotocol" data-embed-version="2" data-pen-title="Origin.js: Create Listing" class="codepen">See the Pen <a href="https://codepen.io/originprotocol/pen/oyPrNV/">Origin.js: Create Listing</a> by Origin Protocol (<a href="https://codepen.io/originprotocol">@originprotocol</a>) on <a href="https://codepen.io">CodePen</a>.</p>

## buy

> To buy a listing

```javascript
const unitstoBuy = 2
const amountToSend = listing.price * unitstoBuy
const transaction = await origin.listings.buy(
      listing.address,
      unitstoBuy,
      amountToSend
    )
await origin.contractService.waitTransactionFinished(transaction.tx)
```

Buy will create a new `Purchase` contract on the blockchain. This purchase contract will handle the rest of the transaction between the buyer and the seller.

## close

> To close a listing

```javascript
const transaction = await origin.listings.close(
      listing.address
    )
await origin.contractService.waitTransactionFinished(transaction.tx)
```

This method is **called by the seller**.

Closing a transaction will set the unitsAvailable to zero. This will stop any further purchases of that Listing.

## allIds

> To find all listing indexes

```javascript
const indexes = await origin.listings.allIds()
// Returns
[0,1,2,3,4,5,...]
```

You can get a simple list of all listing indexes in the registry, which will allow you to loop through fetch information about each Listing.

## purchasesLength

> To find the number of purchases for a listing

```javascript
const listingAddress = "0xbe3a878bfc1e1527858756c062fbfe0db069c459"
const length = await origin.listings.purchasesLength(listingAddress)
// Returns
4
```

This will return the number of purchases that have occurred for a given listing address.

## purchaseAddressByIndex

> To find a purchase address for a listing

```javascript
const listingAddress = "0xbe3a878bfc1e1527858756c062fbfe0db069c459"
await origin.listings.purchaseAddressByIndex(listingAddress, 0)
// Returns
"0x9deee0195f88caf7dee2fa8a6777f8236d847ef8"
```

For listings that have one or more purchases, you can get the purchase address at a given index position.
