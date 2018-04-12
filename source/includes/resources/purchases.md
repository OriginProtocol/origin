# Purchase

A **Purchase** is a single transaction between a buyer and seller. A single [Listing](#listing) with multiple items for sale could have many Purchases related to it, one for each buyer.

A Purchase is a stage machine. 

When a Listing is purchased, a new Purchase contract is created. In the simplest, success case, a Purchase moves through the following stages:

`shipping_pending` → `buyer_pending` → `seller_pending` → `complete`

## pay

> To pay eth into a purchase

```javascript
const transaction = await origin.purchases.pay(purchase_address, amountWei)
await transaction.isFinished()
``` 

This method is **called by the buyer** when the Purchase is in the **"awaiting_payment"** stage.

If the total amount in the Purchase contract is now equal to, or greater than the price of the sale, then the Purchase will change to the **"shipping_pending"** stage.

_You don't currently need to use this method currently. Purchases are fully funded when bought from Listings._

## sellerConfirmShipped

> To mark a purchase as shipped

```javascript
const transaction = await origin.purchases.sellerConfirmShipped(purchase_address)
await transaction.isFinished()
```

This method is **called by the seller** when the Purchase is in the **"shipping_pending"** stage.

The Purchase will change to the **"buyer_pending"** stage. A 21 day timer will start for the buyer to mark the purchase as received. If the buyer does not market the purchase received in this time, it will automatically be marked received at the end of 21 days.

## buyerConfirmReceipt

> To mark a purchase as received

```javascript
const transaction = await origin.purchases.buyerConfirmReceipt(purchase_address)
await transaction.isFinished()
```

This method is **called by the buyer** when the Purchase is in the **"buyer_pending"** stage.

The Purchase will change to the **"seller_pending"** stage.

## sellerGetPayout

> To mark a purchase as received

```javascript
const transaction = await origin.purchases.sellerGetPayout(purchase_address)
await transaction.isFinished()
```

This method is **called by the seller** when the Purchase is in the **"seller_pending"** stage.

The seller will receive all eth value on the contract.

The Purchase will change to the **"complete"** stage.