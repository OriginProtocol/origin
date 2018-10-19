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

|Name|Type|Required|Default|Description|
|----|-----|-----|-----|-----|
|**idsOnly** |bool|optional|false||
|**listingsFor** | string |optional||user's address|
|**purchasesFor** | string |optional||user's address|
