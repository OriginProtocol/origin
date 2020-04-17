const { authSellerAndShop } = require('./_auth')
const { Order } = require('../models')
const { findOrder } = require('../utils/orders')

module.exports = function(app) {
  app.get('/orders', authSellerAndShop, async (req, res) => {
    const orders = await Order.findAll({
      where: { shopId: req.shop.id },
      order: [['createdBlock', 'desc']]
    })
    res.json(orders)
  })

  app.get('/orders/:orderId', authSellerAndShop, findOrder, (req, res) => {
    res.json(req.order)
  })
}
