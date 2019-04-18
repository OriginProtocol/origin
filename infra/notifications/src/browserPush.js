const Sequelize = require('sequelize')
const PushSubscription = require('./models').PushSubscription
const { getNotificationMessage } = require('./notification')
const webpush = require('web-push')
const logger = require('./logger')

//
// Browser push subscripttions
//
async function browserPush(
  eventName,
  party,
  buyerAddress,
  sellerAddress,
  offer
) {
  if (!eventName) throw 'eventName not defined'
  if (!party) throw 'party not defined'
  if (!buyerAddress) throw 'buyerAddress not defined'
  if (!sellerAddress) throw 'sellerAddress not defined'
  if (!offer) throw 'offer not defined'

  // Query the DB to get subscriptions from the seller and/or buyer.
  // Note the filter ensures we do not send notification to the party
  // who initiated the action:
  //  - seller initiated action -> only buyer gets notified.
  //  - buyer initiated action -> only seller gets notified.
  //  - 3rd party initiated action -> both buyer and seller get notified.
  const subs = await PushSubscription.findAll({
    where: {
      account: {
        [Sequelize.Op.in]: [buyerAddress, sellerAddress].filter(
          a => a && a !== party
        )
      }
    }
  })

  // Filter out redundant endpoints before iterating.
  await subs
    .filter((s, i, self) => {
      return self.map(ms => ms.endpoint).indexOf(s.endpoint) === i
    })
    .forEach(async s => {
      try {
        const recipient = s.account
        const recipientRole = recipient === sellerAddress ? 'seller' : 'buyer'

        const message = getNotificationMessage(
          eventName,
          party,
          recipient,
          recipientRole
        )
        if (!message) {
          return
        }

        // Send the push notification.
        // TODO: Add safeguard against sending duplicate messages since the
        // event-listener only provides at-least-once guarantees and may
        // call this webhook more than once for the same event.
        const pushSubscription = {
          endpoint: s.endpoint,
          keys: s.keys
        }
        const pushPayload = JSON.stringify({
          title: message.title,
          body: message.body,
          account: recipient,
          offerId: offer.id
        })
        await webpush.sendNotification(pushSubscription, pushPayload)
      } catch (e) {
        // Subscription is no longer valid - delete it in the DB.
        if (e.statusCode === 410) {
          s.destroy()
        } else {
          logger.error(e)
        }
      }
    })
}

module.exports = { browserPush }
