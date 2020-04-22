const { Order } = require('../models')

function findOrder(req, res, next) {
  const { orderId } = req.params
  Order.findOne({ where: { orderId, shopId: req.shop.id } }).then(order => {
    if (!order) {
      return res.status(404).send({ success: false })
    }
    req.order = order
    next()
  })
}

module.exports = {
  findOrder
}
