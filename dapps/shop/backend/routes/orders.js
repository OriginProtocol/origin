const get = require('lodash/get')
const fetch = require('node-fetch')

const { authSellerAndShop } = require('./_auth')
const { Order } = require('../models')
const encConf = require('../utils/encryptedConfig')
const { PRINTFUL_URL } = require('../utils/const')

const PrintfulURL = PRINTFUL_URL

function findOrder(req, res, next) {
  const { orderId } = req.params
  Order.findOne({
    where: { orderId, shopId: req.shop.id }
  }).then(order => {
    if (!order) {
      return res.status(404).send({ success: false })
    }
    req.order = order
    next()
  })
}

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

  app.get(
    '/orders/:orderId/printful',
    authSellerAndShop,
    findOrder,
    async (req, res) => {
      const apiKey = await encConf.get(req.order.shopId, 'printful')
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: 'Missing printful API configuration'
        })
      }
      const apiAuth = Buffer.from(apiKey).toString('base64')

      const result = await fetch(
        `${PrintfulURL}/orders/@${req.order.orderId}`,
        {
          headers: {
            'content-type': 'application/json',
            authorization: `Basic ${apiAuth}`
          }
        }
      )
      const json = await result.json()
      res.json(get(json, 'result'))
    }
  )

  app.post(
    '/orders/:orderId/printful/create',
    authSellerAndShop,
    findOrder,
    async (req, res) => {
      const apiKey = await encConf.get(req.order.shopId, 'printful')
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: 'Missing printful API configuration'
        })
      }
      const apiAuth = Buffer.from(apiKey).toString('base64')

      const newOrderResponse = await fetch(`${PrintfulURL}/orders`, {
        headers: {
          'content-type': 'application/json',
          authorization: `Basic ${apiAuth}`
        },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify(req.body)
      })

      const json = await newOrderResponse.json()

      console.log(json)

      if (!newOrderResponse.ok) {
        console.error('Attempt to create Printful order failed!')
        if (json && json.error) console.error(json.error.message)
        return res.status(json.code).json({
          success: false,
          message: json.error.message
        })
      }

      res.json({ success: true })
    }
  )

  app.post(
    '/orders/:orderId/printful/confirm',
    authSellerAndShop,
    findOrder,
    async (req, res) => {
      const apiKey = await encConf.get(req.order.shopId, 'printful')
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: 'Missing printful API configuration'
        })
      }
      const apiAuth = Buffer.from(apiKey).toString('base64')

      const url = `${PrintfulURL}/orders/@${req.params.id}/confirm`
      const confirmOrderResponse = await fetch(url, {
        headers: {
          'content-type': 'application/json',
          authorization: `Basic ${apiAuth}`
        },
        credentials: 'include',
        method: 'POST'
      })
      const json = await confirmOrderResponse.json()
      console.log(json)

      res.json({ success: true })
    }
  )
}
