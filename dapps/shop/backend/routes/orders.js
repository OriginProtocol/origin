const { Orders } = require('../data/db')
const auth = require('./_basicAuth')
const get = require('lodash/get')
const bodyParser = require('body-parser')

const PrintfulApiKey = process.env.PRINTFUL

const apiAuth = Buffer.from(PrintfulApiKey).toString('base64')
const PrintfulURL = 'https://api.printful.com'

module.exports = function(app) {
  app.get('/orders', auth, async (req, res) => {
    const orders = await Orders.findAll({ order: [['createdAt', 'desc']] })
    res.json(orders)
  })

  app.get('/orders/:id', auth, async (req, res) => {
    const order = await Orders.findOne({ where: { order_id: req.params.id } })
    res.json(order)
  })

  app.get('/orders/:id/printful', async (req, res) => {
    const result = await fetch(`${PrintfulURL}/orders/@${req.params.id}`, {
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
    bodyParser.json(),
    async (req, res) => {
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

  app.post('/orders/:id/printful/confirm', async (req, res) => {
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
  })
}
