const { Event, Order } = require('../models')
const dayjs = require('dayjs')

async function go() {
  const events = await Event.findAll({
    where: { shopId: 2, eventName: 'OfferCreated' },
    order: [['block_number', 'asc']],
    raw: true
  })
  for (const event of events) {
    // console.log(event)
    const orderId = `1-001-81-${event.offerId}`
    const csv = [
      orderId,
      event.blockNumber,
      event.timestamp,
      dayjs(event.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss'),
      event.transactionHash,
      event.party
    ]
    const offer = await Order.findOne({
      where: { orderId },
      raw: true
    })
    if (offer) {
      try {
        const data = JSON.parse(offer.data)
        csv.push(data.total)
        csv.push(data.paymentMethod.label)
        csv.push(data.userInfo.country)
        csv.push(data.userInfo.firstName)
        csv.push(data.userInfo.lastName)
        csv.push(data.userInfo.email)
      } catch (e) {
        /* Ignore */
      }
    }
    console.log(csv.join(','))
  }
}

go()
