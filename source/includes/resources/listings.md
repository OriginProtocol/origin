# Listing

A listing is an offer from a seller to sell something.

It is active until there are no more units available or its expiration date is reached.

## create

> To create a listing

```javascript
const listingData = {
  name: "Kettlebell For Sale",
  category: "Health and Beauty",
  location: "San Fransisco, CA",
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


## getByIndex

> To get a listing

```javascript
const listing = await origin.listings.getByIndex(1)
// Returns 
{
  name: "Kettlebell For Sale",
  category: "Health and Beauty",
  description: "32kg gorilla kettlebell",
  location: "San Fransisco, CA",
  pictures: [],

  address: "659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63",
  index: 1,
  ipfsHash: "QmWZDcDq4aYGx9XmkPcx4mnKaGW2jCxf5tknrCtbfpJJFf",
  sellerAddress: "0f62d96d6675f32685bbdb8ac13cda7c23436f63efbb9d07700d8669ff12b7c4",
  price: 0.004,
  unitsAvailable: 1
}
```

Getting a listing will return the fields from the listing according to its listing schema.

In addition, you'll have fields from the contract on the blockchain.

## allIds

> To find all listing indexes

```javascript
const indexes = await origin.listings.allIds()
// Returns 
[0,1,2,3,4,5,...]
```

You can get a simple list of all listing indexes in the registry, which will allow you to loop through fetch information about each Listing.