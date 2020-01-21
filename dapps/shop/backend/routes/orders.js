const get = require('lodash/get')
const fetch = require('node-fetch')

const { authenticated, authenticatedAsSeller } = require('./_combinedAuth')
const { Shops, Orders } = require('../data/db')
const { storeGate } = require('../utils/gates')
const encConf = require('../utils/encryptedConfig')
const { PRINTFUL_URL } = require('../utils/const')

const PrintfulURL = PRINTFUL_URL

module.exports = function(app) {
  // TODO: Do the following two endpoints get used by users?
  app.get('/orders', authenticated, storeGate, async (req, res) => {
    const orders = await Orders.findAll({
      where: { store_id: req.stoerId },
      order: [['createdAt', 'desc']]
    })
    res.json(orders)
  })

  app.get('/orders/:id', authenticated, storeGate, async (req, res) => {
    const order = await Orders.findOne({
      where: {
        order_id: req.params.id,
        store_id: req.stoerId
      }
    })
    res.json(order)
  })

  app.get('/orders/:id/printful', authenticatedAsSeller, async (req, res) => {
    const { id } = req.params

    const order = await Orders.findOne({
      where: {
        id
      },
      include: [
        {
          model: Shops,
          as: Shops.tableName,
          where: {
            seller_id: req.user.id
          },
          required: true
        }
      ]
    })

    if (!order) {
      return res.json({
        success: false,
        message: 'Order not found'
      })
    }

    const apiKey = await encConf.get(order.shop_id, 'printful')
    if (!apiKey) throw new Error('Missing printful API configuration')
    const apiAuth = Buffer.from(apiKey).toString('base64')

    const result = await fetch(`${PrintfulURL}/orders/@${id}`, {
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${apiAuth}`
      }
    })
    const json = await result.json()
    res.json(get(json, 'result'))
  })

  app.post(
    '/orders/:id/printful/create',
    authenticatedAsSeller,
    async (req, res) => {
      const { id } = req.params

      const order = await Orders.findOne({
        where: {
          id,
          'Shops.seller_id': req.user.id
        },
        include: [{ model: Shops, as: Shops.tableName }]
      })

      if (!order) {
        return res.json({
          success: false,
          message: 'Order not found'
        })
      }

      const apiKey = await encConf.get(order.shop_id, 'printful')
      if (!apiKey) throw new Error('Missing printful API configuration')
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

      res.json({ success: true })
    }
  )

  app.post(
    '/orders/:id/printful/confirm',
    authenticatedAsSeller,
    async (req, res) => {
      const { id } = req.params

      const order = await Orders.findOne({
        where: {
          id,
          'Shops.seller_id': req.user.id
        },
        include: [{ model: Shops, as: Shops.tableName }]
      })

      if (!order) {
        return res.json({
          success: false,
          message: 'Order not found'
        })
      }

      const apiKey = await encConf.get(order.shop_id, 'printful')
      if (!apiKey) throw new Error('Missing printful API configuration')
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
