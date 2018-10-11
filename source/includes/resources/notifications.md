# Notifications

Each **Notification** corresponds to a state change of a [Purchase](#purchase). Notifications are currently generated for each of the following purchase stages:

- `in_escrow`
- `seller_pending`
- `buyer_pending`
- `complete`

Notifications do not exist on the blockchain nor are they read from a database. They are derived from the blockcahin transaction logs of purchases at the time of the API request. Because of this, there is no central record of a notification's status as "read" or "unread". When a client first interacts with the notifications API, Origin.js will record a timestamp in local storage. All notifications resulting from blockchain events that happen prior to this timestamp will be considered to be "read". This ensures that when the same user interacts with the notifications API from a different client for the first time, they will not receive a large number of "unread" notifications that they have previously read from their original client.

## all

> To get all notifications for a given ETH account

```javascript
const userAddress = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"
const notifications = await origin.notifications.all(userAddress)
// Returns 
[
  {
    "id": "seller_listing_purchased_0x23172349165f59c95567e1e993e473ba914d0dd4fe59ee398b051cfda4cea622_0xCa163A64f8c3d8A6c15A46f95DA492476Ef3E613",
    "type": "seller_listing_purchased",
    "status": "unread",
    "resources": {
      "listing": {
        "address": "0x4E205e04A1A8f230702fe51f3AfdCC38aafB0f3C",
        "ipfsHash": "QmfXRgtSbrGggApvaFCa88ofeNQP79G18DpWaSW1Wya1u8",
        "sellerAddress": "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
        "priceWei": "300000000000000000",
        "price": "0.3",
        "unitsAvailable": "23",
        "created": "1530320045",
        "expiration": "1535504045",
        "name": "Taylor Swift's Reputation Tour",
        "category": "Music",
        "description": "Taylor Swift's Reputation Stadium Tour is the fifth world concert tour by American singer-songwriter Taylor Swift, in support of her sixth studio album, Reputation.",
        "location": "Sports Authority Field at Mile High, Denver, CO, USA"
      },
      "purchase": {
        "address": "0xc7a3D1D729F268Adf375aC84c497D236fd95c35B",
        "stage": "complete",
        "listingAddress": "0x4E205e04A1A8f230702fe51f3AfdCC38aafB0f3C",
        "buyerAddress": "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
        "created": 1530320046,
        "buyerTimeout": 1532134446
      }
    }
  },
  ...
]
```

This will return an array of notification objects, each containing the following properties:

- `id`: a concatenated `String` consisting of the event type, transaction hash, and purchase address
- `type`: a `String` descriptor of the purchase stage: `seller_listing_purchased`, `seller_review_received`, `buyer_listing_shipped`, or `buyer_review_received`
- `status`: a `String` representation of the notification state: `read` or `unread`
- `resources`: a convenience `Object` containing the [Listing](#listing) and the [Purchase](#purchase) objects

## set

> To update the status of a notification

```javascript
await origin.notifications.set({
  id: "seller_listing_purchased_0x23172349165f59c95567e1e993e473ba914d0dd4fe59ee398b051cfda4cea622_0xCa163A64f8c3d8A6c15A46f95DA492476Ef3E613",
  status: "read",
})
``` 

Since notification objects do not live on the blockchain or in a database, this method only records an update to the client's local storage. It accepts a single parameter, which should be an object containing the `id` of the notification and a `status` value of either `read` or `unread`. Any other properties included in this object will be ignored.
