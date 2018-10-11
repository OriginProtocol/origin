# Purchase

A **Purchase** is a single transaction between a buyer and seller. A single [Listing](#listing) with multiple items for sale could have many Purchases related to it, one for each buyer.

A new Purchase contract is created when a buyer purchases a Listing. 

A Purchase is a state machine that moves through stages. In the simplest, success case, a Purchase moves through the following stages:

`shipping_pending` → `buyer_pending` → `seller_pending` → `complete`

## get

> To get a purchase

```javascript
const purchaseAddress = "0x061b8d5f9e432e6b23d79fac02e5792eb8746ce5"
const purchase = await origin.purchases.get(purchaseAddress)
// Returns 
{
  address: "0xefb3fd7f9260874d8afd7cb4b42183babea0ca1b",
  stage: "seller_pending",
  listingAddress: "0x05a52d9a9e9e91c6932ec2af7bf0c127660fa181",
  buyerAddress: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
  created: 1524492517,
  buyerTimeout: 0
}
```

This will return information about the purchase.

## pay

> To pay eth into a purchase

```javascript
const transaction = await origin.purchases.pay(purchaseAddress, amountWei)
await transaction.isFinished()
``` 

This method is **called by the buyer** when the Purchase is in the **"awaiting_payment"** stage.

If the total amount in the Purchase contract is now equal to, or greater than the price of the sale, then the Purchase will change to the **"shipping_pending"** stage.

_You don't currently need to use this method currently. Purchases are fully funded when bought from Listings._

## sellerConfirmShipped

> To mark a purchase as shipped

```javascript
const transaction = await origin.purchases.sellerConfirmShipped(purchaseAddress)
await transaction.isFinished()
```

This method is **called by the seller** when the Purchase is in the **"shipping_pending"** stage.

The Purchase will change to the **"buyer_pending"** stage. A 21 day timer will start for the buyer to mark the purchase as received. If the buyer does not market the purchase received in this time, it will automatically be marked received at the end of 21 days.

## buyerConfirmReceipt

> To mark a purchase as received

```javascript
const review = {rating: 5, reviewText: "Prompt shipping!" }
const transaction = await origin.purchases.buyerConfirmReceipt(purchaseAddress, review)
await transaction.isFinished()
```

This method is **called by the buyer** when the Purchase is in the **"buyer_pending"** stage.

The Purchase will change to the **"seller_pending"** stage.

A rating from 1 to 5 is required as a part of a review. Review text is optional.

## sellerGetPayout

> To mark a purchase as received

```javascript
const review = {rating: 5, reviewText: "Good buyer!" }
const transaction = await origin.purchases.sellerGetPayout(purchaseAddress, review)
await transaction.isFinished()
```

This method is **called by the seller** when the Purchase is in the **"seller_pending"** stage.

The seller will receive all eth value on the contract.

The Purchase will change to the **"complete"** stage.

A rating from 1 to 5 is required as a part of a review. Review text is optional.

## getLogs

> To get the transaction logs for a purchase

```javascript
const purchaseAddress = "0xab4c10f7c47e2c94f9ecbe1649c4d0ee53b8982a"
const transaction = await origin.purchases.getLogs(purchaseAddress)
// Returns
[
  {
    "transactionHash": "0xba1ec178d03935f6dc862a54d7e16070bf240a9890cdc79a0d14a3649b4adf19",
    "stage": "awaiting_payment",
    "blockNumber": 25,
    "blockHash": "0x417bebc8d87e57940115a88a0b0d80d2a148ac0f556be661d83fdfa916898609",
    "event": "PurchaseChange",
    "from": "0x821aea9a577a9b44299b9c15c88cf3087f3b5544",
    "timestamp": 1525235927
  },
  {
    "transactionHash": "0xba1ec178d03935f6dc862a54d7e16070bf240a9890cdc79a0d14a3649b4adf19",
    "stage": "shipping_pending",
    "blockNumber": 25,
    "blockHash": "0x417bebc8d87e57940115a88a0b0d80d2a148ac0f556be661d83fdfa916898609",
    "event": "PurchaseChange",
    "from": "0x821aea9a577a9b44299b9c15c88cf3087f3b5544",
    "timestamp": 1525235927
  },
  {
    "transactionHash": "0xe0ecb8c1d2cf7b5d44cb4a32e66b13d0532222e3201832c89f173247154d702c",
    "stage": "buyer_pending",
    "blockNumber": 26,
    "blockHash": "0xf27b14413d1f8bae277c65c1b1d16a42382faf69612d9e7109869610d531314a",
    "event": "PurchaseChange",
    "from": "0x627306090abab3a6e1400e9345bc60c78a8bef57",
    "timestamp": 1525235927
  },
  {
    "transactionHash": "0x1b6222075fc643a505cef8914f9f7c2f7d8d5a619c1d1e86d9711569881909e7",
    "stage": "seller_pending",
    "blockNumber": 27,
    "blockHash": "0x337929056f657fb831bf621f53fe2999ecf598a1d0bf509e8c8104ae51fcaa70",
    "event": "PurchaseChange",
    "from": "0x821aea9a577a9b44299b9c15c88cf3087f3b5544",
    "timestamp": 1525235927
  },
  {
    "transactionHash": "0xf53c6300b15ca1abd8b8bdfebee1f40ba870213a4d166368810fab1d3a0b8c9c",
    "stage": "complete",
    "blockNumber": 28,
    "blockHash": "0x75ce342571398d38727c018ce6ab859d2c1863e7322ee540f9ddfe795189580b",
    "event": "PurchaseChange",
    "from": "0x627306090abab3a6e1400e9345bc60c78a8bef57",
    "timestamp": 1525235927
  }
]
```

This method will return an array of log objects representing each blockchain transaction associated with the Purchase.

Note that the `stage` value indicates the state of the contract _after_ the transaction is recorded rather than indicating what action was taken to update the Purchase.
