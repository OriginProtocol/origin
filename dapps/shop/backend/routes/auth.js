const omit = require('lodash/omit')
const { Seller, Shop } = require('../models')
const { checkPassword } = require('./_auth')
const { createSeller } = require('../utils/sellers')
const { IS_PROD } = require('../utils/const')
const encConf = require('../utils/encryptedConfig')
const { authSellerAndShop } = require('./_auth')
const { validateConfig, validateShop } = require('../utils/validators')

module.exports = function(app) {
  app.get('/auth', (req, res) => {
    if (!req.session.sellerId) {
      return res.json({ success: false })
    }
    Seller.findOne({ where: { id: req.session.sellerId } }).then(seller => {
      res.json({ success: true, email: seller.email })
    })
  })

  app.get('/auth/:email', async (req, res) => {
    // TODO: Add some rate limiting here
    const { email } = req.params
    const seller = await Seller.findOne({ where: { email } })
    return res.sendStatus(seller === null ? 404 : 204)
  })

  app.post('/auth/login', async (req, res) => {
    const seller = await Seller.findOne({ where: { email: req.body.email } })
    if (!seller) {
      return res.status(404).send({ success: false })
    }
    const check = await checkPassword(req.body.password, seller.password)
    if (check === true) {
      req.session.sellerId = seller.id
      res.json({ success: true })
    } else {
      res.json({ success: false })
    }
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
    const { seller, status, error } = await createSeller(req.body)

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

    const destroy = await Seller.destroy({ where: { id: sellerId } })

    req.logout()
    res.json({ success: false, destroy })
  })

  app.get('/shop', async (req, res) => {
    const { sellerId } = req.session

    if (!sellerId) {
      return res.status(400).json({ success: false })
    }

    const rows = await Shop.findAll({ where: { sellerId } })

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

    const shop = await Shop.create({
      ...shopObj,
      sellerId: req.session.sellerId
    })

    res.json({ success: true, shop })
  })

  app.delete('/shop', authSellerAndShop, async (req, res) => {
    await Shop.destroy({
      where: {
        id: req.body.id,
        sellerId: req.session.sellerId
      }
    })
    res.json({ success: true })
  })

  app.get('/config', authSellerAndShop, async (req, res) => {
    const config = await encConf.dump(req.shop.id)
    return res.json({ success: true, config })
  })

  app.post('/config', authSellerAndShop, async (req, res) => {
    const config = req.body

    if (!validateConfig(config)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid config data' })
    }

    await encConf.assign(req.shop.id, config)
    return res.json({ success: true })
  })

  app.get('/config/dump', authSellerAndShop, async (req, res) => {
    if (!req.session.sellerId) {
      return res.json({ success: false })
    }
    const { id } = req.shop

    // Testing only
    if (IS_PROD) return res.sendStatus(404)

    const shop = await Shop.findOne({
      where: { id, sellerId: req.session.sellerId }
    })

    if (!shop) {
      return res.status(404)
    }

    const config = await encConf.dump(id)
    return res.json({ success: true, config })
  })
}
