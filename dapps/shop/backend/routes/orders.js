const { authSellerAndShop } = require('./_auth')
const { Order } = require('../models')
const { findOrder, makeOffer } = require('../utils/orders')
const sendMail = require('../utils/emailer')

module.exports = function(app) {
  app.get('/orders', authSellerAndShop, async (req, res) => {
    const orders = await Order.findAll({
      where: { shopId: req.shop.id },
      order: [['createdAt', 'desc']]
    })
    res.json(orders)
  })

  app.get('/orders/:orderId', authSellerAndShop, findOrder, (req, res) => {
    res.json(req.order)
  })

  app.post('/orders/:orderId/email', authSellerAndShop, findOrder, async (req, res) => {
    try {
      await sendMail(req.shop.id, JSON.parse(req.order.data))
      res.json({ success: true })
    } catch(e) {
      res.json({ success: false })
    }
  })

  app.post('/orders/create', authSellerAndShop, (req, res) => {
    const { encryptedData } = req.body
    if (!encryptedData) {
      return res.json({ success: false })
    }
    makeOffer({ shop: req.shop, encryptedData })
      .then(() => res.sendStatus(200))
      .catch(err => {
        console.error(err)
        res.status(500)
        return
      })

    res.json({ success: true })
  })
}
