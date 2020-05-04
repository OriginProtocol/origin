const fetch = require('node-fetch')
const { authShop } = require('./_auth')
const encConf = require('../utils/encryptedConfig')
const makeOffer = require('./_makeOffer')
const { Shop } = require('../models')
const sortBy = require('lodash/sortBy')

const UpholdEndpoints = {
  production: {
    api: 'https://api.uphold.com',
    auth: 'https://www.uphold.com'
  },
  sandbox: {
    api: 'https://sandbox-api.uphold.com',
    auth: 'https://sandbox.uphold.com'
  }
}

module.exports = function(app) {
  app.get('/uphold/authed', authShop, async (req, res) => {
    const upholdApi = await encConf.get(req.shop.id, 'upholdApi')
    if (!UpholdEndpoints[upholdApi]) {
      return res.json({ authed: false, message: 'Uphold not configured' })
    }
    const authToken = req.session.upholdAccessToken
    if (authToken) {
      const response = await fetch(`${UpholdEndpoints[upholdApi].api}/v0/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      const json = await response.json()

      return res.json({ authed: json.id ? true : false })
    }

    const clientId = await encConf.get(req.shop.id, 'upholdClient')
    const state = Math.floor(Math.random() * 10000000)
    req.session.upholdAuth = { shop: req.shop.id, state }
    const scopes = [
      'transactions:transfer:application',
      'transactions:transfer:others',
      'transactions:read',
      'user:read',
      'cards:read'
    ]
    const baseUri = `${UpholdEndpoints[upholdApi].auth}/authorize/${clientId}`
    res.json({
      authed: false,
      redirect: `${baseUri}?scope=${scopes.join(' ')}&state=${state}`
    })
  })

  app.get('/uphold/auth-response', async (req, res) => {
    const { upholdAuth } = req.session
    const { code, state } = req.query
    if (!upholdAuth) {
      console.log('No upholdAuth in session')
      res.send(`<script>window.opener.postMessage('error', '*')</script>Err`)
      return
    }

    if (state !== String(upholdAuth.state)) {
      console.log('Incorrect upholdAuth state', state, upholdAuth.state)
      res.send(`<script>window.opener.postMessage('error', '*')</script>Err`)
      return
    }

    const shop = await Shop.findOne({ where: { id: upholdAuth.shop } })
    if (!shop) {
      console.log('No shop')
      res.send(`<script>window.opener.postMessage('error', '*')</script>Err`)
      return
    }
    const upholdApi = await encConf.get(shop.id, 'upholdApi')
    if (!UpholdEndpoints[upholdApi]) {
      console.log('Uphold not configured')
      res.send(`<script>window.opener.postMessage('error', '*')</script>Err`)
    }

    const clientId = await encConf.get(shop.id, 'upholdClient')
    const clientSecret = await encConf.get(shop.id, 'upholdSecret')

    const response = await fetch(
      `${UpholdEndpoints[upholdApi].api}/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: [
          `client_id=${clientId}`,
          `client_secret=${clientSecret}`,
          'grant_type=authorization_code',
          `code=${code}`
        ].join('&')
      }
    )

    const body = await response.json()
    if (body.access_token) {
      req.session.upholdAccessToken = body.access_token
    }

    res.send(`<script>window.opener.postMessage('ok', '*')</script>OK`)
  })

  app.get('/uphold/cards', authShop, async (req, res) => {
    const upholdApi = await encConf.get(req.shop.id, 'upholdApi')
    if (!UpholdEndpoints[upholdApi]) {
      return res.json({ success: false, message: 'Uphold not configured' })
    }
    const authToken = req.session.upholdAccessToken
    // console.log('Token', authToken)
    if (!authToken) {
      return res.json({ success: false })
    }
    const response = await fetch(
      `${UpholdEndpoints[upholdApi].api}/v0/me/cards`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    )
    const json = await response.json()
    const cards = json.map(card => {
      const { id, label, balance, currency, normalized } = card
      const norm = normalized.find(n => n.currency === 'USD')
      return {
        id,
        label,
        balance,
        normalizedBalance: Number(norm.balance),
        currency
      }
    })
    const filteredCards = cards.filter(c => c.balance !== '0.00')
    const sortedCards = sortBy(filteredCards, [o => -o.normalizedBalance])
    res.json(sortedCards)
  })

  // body: { amount, listingId, data }
  app.post(
    '/uphold/pay',
    authShop,
    async (req, res, next) => {
      const upholdApi = await encConf.get(req.shop.id, 'upholdApi')
      if (!UpholdEndpoints[upholdApi]) {
        return res.json({ success: false, message: 'Uphold not configured' })
      }

      const authToken = req.session.upholdAccessToken

      if (!authToken) {
        return res.json({ success: false, reason: 'Bad auth token' })
      }
      if (!req.body.amount) {
        return res.json({ success: false, reason: 'No amount' })
      }
      if (!req.body.data) {
        return res.json({ success: false, reason: 'No encrypted data' })
      }
      if (!req.body.card) {
        return res.json({ success: false, reason: 'No card' })
      }

      const upholdClient = await encConf.get(req.shop.id, 'upholdClient')

      const url = `${UpholdEndpoints[upholdApi].api}/v0/me/cards/${req.body.card}`
      const response = await fetch(`${url}/transactions?commit=true`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          denomination: { amount: req.body.amount, currency: 'USD' },
          destination: upholdClient
        })
      })

      const json = await response.json()
      // console.log(JSON.stringify(json, null, 2))

      if (json.errors) {
        return res.json({ error: 'Error' })
      }

      next()
    },
    makeOffer
  )
}
