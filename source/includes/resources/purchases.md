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
	buyerTimout: 0
}
```

This will return information about the purchase.

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