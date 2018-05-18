# Review

Reviews are created by the buyer in the [receipt](/#purchase-buyerconfirmreceipt) stage and by the seller in the [payout](#purchase-sellergetpayout) stage of the purchase process. A review consists of a required 1-5 rating and an optional reviewText text field.

## find

> To lookup reviews

```javascript
const purchaseAddress = "0x521b8d5f9e432e6b23d79fac02e5792eb8746ce1"
const reviews = await origin.reviews.find({purchaseAddress: purchaseAddress})
// Returns 
[{
    blockHash: "0xf8d740a4eb381f99c259129da68df30b6a63cb3596839b4b40f01e8e4b55821b",
    blockNumber: 20,
    ipfsHash: undefined,
    purchaseAddress: "0x521b8d5f9e432e6b23d79fac02e5792eb8746ce1",
    rating: 5,
    reviewText: "",
    revieweeAddress: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
    revieweeRole: "BUYER",
    reviewerAddress: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
    timestamp: 1526496009,
    transactionHash: "0x94642427369cc50cee75a92df128c654c7d62b644d6c00f76e2404eadadf38bb"
},
{
    rating: 5,
    reviewText: "Very quick payment",
    blockHash: "0xcce740a4eb381f99c259129da68df30b6a63cb3596839b4b40f01e8e4b55821b",
    blockNumber: 220,
    ipfsHash: "QmfXRgtSbrGggApvaFCa88ofeNQP79G18DpWaSW1Wya1u8",
    purchaseAddress: "0x521b8d5f9e432e6b23d79fac02e5792eb8746ce1",
    revieweeAddress: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
    revieweeRole: "SELLER",
    reviewerAddress: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
    timestamp: 1526496009,
    transactionHash: "0xAC642427369cc50cee75a92df128c654c7d62b644d6c00f76e2404eadadfr91a"
}]
```

You can find reviews with the following filter options:

- `purchaseAddress`
- `userAddress` - support coming soon
- `sellerAddress` - support coming soon
- `buyerAddress` - support coming soon
- `listingAddress` - support coming soon