const omit = require('lodash/omit')
const { Sellers, Shops } = require('../data/db')
const { checkPassword } = require('./_auth')
const { createSeller } = require('../utils/sellers')
const { IS_PROD } = require('../utils/const')
const encConf = require('../utils/encryptedConfig')
const { validateConfig, validateShop } = require('../utils/validators')

module.exports = function(app) {
  app.get('/auth', (req, res) => {
    if (!req.session.sellerId) {
      return res.json({ success: false })
    }
    Sellers.findOne({ where: { id: req.session.sellerId } }).then(seller => {
      res.json({ success: true, email: seller.email })
    })
  })

  app.get('/auth/:email', async (req, res) => {
    // TODO: Add some rate limiting here
    const { email } = req.params
    const seller = await Sellers.findOne({ where: { email } })
    return res.sendStatus(seller === null ? 404 : 204)
  })

  app.post('/auth/login', async (req, res) => {
    Sellers.findOne({ where: { email: req.body.email } }).then(seller => {
      if (!seller) {
        res.status(404).send({ success: false })
        return
      }
      if (checkPassword(seller.password, req.body.password)) {
        req.session.sellerId = seller.id
        res.json({ success: true })
      } else {
        res.json({ success: false })
      }
    })
  })

  const logoutHandler = (req, res) => {
    if (req.session.sellerId) {
      req.logout()
      res.json({ success: true })
    } else {
      res.json({ success: false })
    }
  }

  app.get('/auth/logout', logoutHandler)
  app.post('/auth/logout', logoutHandler)

  // TODO: Should this at least use API key auth?
  app.post('/auth/registration', async (req, res) => {
    const { seller, status, error } = createSeller(req.body)

    if (error) {
      return res.status(status).json({ success: false, message: error })
    }

    if (!seller) {
      return res.json({ success: false })
    }

    req.session.sellerId = seller.id
    res.json({ success: true })
  })

  app.delete('/auth/registration', async (req, res) => {
    const { sellerId } = req.session

    if (!sellerId) {
      return res.status(400).json({ success: false })
    }

    if (!sellerId) {
      return res.status(400).json({ success: false })
    }

    const destroy = await Sellers.destroy({ where: { id: sellerId } })

    req.logout()
    res.json({ success: false, destroy })
  })

  app.get('/shop', async (req, res) => {
    const { sellerId } = req.session

    if (!sellerId) {
      return res.status(400).json({ success: false })
    }

    const rows = await Shops.findAll({ where: { sellerId } })

    const shops = []
    for (const row of rows) {
      const shopData = omit(row.dataValues, ['config', 'sellerId'])
      shopData.dataUrl = await encConf.get(row.id, 'dataUrl')
      shops.push(shopData)
    }

    res.json({
      success: true,
      shops
    })
  })

  app.post('/shop', async (req, res) => {
    if (!req.session.sellerId) {
      return res.json({ success: false })
    }

    const shopObj = req.body

    if (!validateShop(shopObj)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid shop data' })
    }

    const shop = await Shops.create({
      ...shopObj,
      sellerId: req.session.sellerId
    })

    res.json({ success: true, shop })
  })

  app.delete('/shop', async (req, res) => {
    if (!req.session.sellerId) {
      return res.json({ success: false })
    }

    await Shops.destroy({
      where: {
        id: req.body.id,
        sellerId: req.session.sellerId
      }
    })
    res.json({ success: true })
  })

  app.post('/config', async (req, res) => {
    const { sellerId } = req.session
    const { shopId, config } = req.body

    const shop = await Shops.findOne({
      where: { id: shopId, sellerId }
    })

    if (!shop) {
      return res.status(400).json({ success: false, message: 'Shop not found' })
    }

    if (!validateConfig(config)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid config data' })
    }

    console.log('config to update: ', config)

    await encConf.assign(shopId, config)
    return res.json({ success: true })
  })

  app.get('/config/dump/:id', async (req, res) => {
    const { id } = req.params

    // Testing only
    if (IS_PROD) return res.sendStatus(404)

    const shop = await Shops.findOne({
      where: { id, sellerId: req.session.sellerId }
    })

    if (!shop) {
      return res.status(404)
    }

    const config = await encConf.dump(id)
    return res.json({ success: true, config })
  })
}
