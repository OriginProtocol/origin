const { Seller, Shop, Network } = require('../models')
const {
  checkPassword,
  authShop,
  authSellerAndShop,
  authRole
} = require('./_auth')
const { createSeller } = require('../utils/sellers')
const encConf = require('../utils/encryptedConfig')
const { validateConfig } = require('../utils/validators')
const get = require('lodash/get')
const omit = require('lodash/omit')

module.exports = function(app) {
  app.get('/auth', authSellerAndShop, (req, res) => {
    if (!req.session.sellerId) {
      return res.json({ success: false })
    }

    const id = req.session.sellerId

    Shop.findAll({
      attributes: ['name', 'id', 'authToken', 'hostname'],
      include: { model: Seller, where: { id } }
    }).then(allShops => {
      const shops = allShops.map(s => ({
        id: s.dataValues.id,
        name: s.dataValues.name,
        authToken: s.dataValues.authToken,
        hostname: s.dataValues.hostname,
        role: get(s, 'Sellers[0].SellerShop.dataValues.role')
      }))

      Seller.findOne({ where: { id } }).then(seller => {
        res.json({
          success: true,
          email: seller.email,
          role: req.sellerShop ? req.sellerShop.role : '',
          shops
        })
      })
    })
  })

  app.get('/superuser/auth', async (req, res) => {
    const userCount = await Seller.count()
    if (!userCount) {
      return res.json({ success: false, reason: 'no-users' })
    }

    if (!req.session.sellerId) {
      return res.json({ success: false, reason: 'not-logged-in' })
    }

    const user = await Seller.findOne({ where: { id: req.session.sellerId } })
    if (!user) {
      return res.json({ success: false, reason: 'not-logged-in' })
    } else if (!user.superuser) {
      return res.json({ success: false, reason: 'not-superuser' })
    }

    const allNetworks = await Network.findAll()
    const networks = allNetworks.map(n => {
      const net = { ...encConf.getConfig(n.config), ...n.dataValues }
      return omit(net, ['config'])
    })
    const network = networks.find(n => n.active)
    if (!network) {
      return res.json({ success: false, reason: 'no-active-network' })
    }

    const { networkId } = network
    const shops = await Shop.findAll({
      where: { networkId },
      order: [['createdAt', 'desc']]
    })
    if (!shops.length) {
      return res.json({ success: false, reason: 'no-shops', networks, network })
    }

    res.json({ success: true, email: user.email, networks, network, shops })
  })

  app.get('/auth/:email', async (req, res) => {
    // TODO: Add some rate limiting here
    const { email } = req.params
    const seller = await Seller.findOne({ where: { email } })
    return res.sendStatus(seller === null ? 404 : 204)
  })

  app.post('/superuser/login', async (req, res) => {
    const email = get(req.body, 'email', '').toLowerCase()
    const seller = await Seller.findOne({ where: { email, superuser: true } })
    if (!seller) {
      return res.status(404).send({ success: false, reason: 'no-such-user' })
    }
    const check = await checkPassword(req.body.password, seller.password)
    if (check === true) {
      req.session.sellerId = seller.id
      res.json({ success: true, email: seller.email, role: 'superuser' })
    } else {
      res.json({ success: false, reason: 'incorrect-pass' })
    }
  })

  app.post(
    '/auth/login',
    async (req, res, next) => {
      const seller = await Seller.findOne({ where: { email: req.body.email } })
      if (!seller) {
        return res.status(404).send({ success: false })
      }
      const check = await checkPassword(req.body.password, seller.password)
      if (check === true) {
        req.session.sellerId = seller.id
        req.seller = seller
        next()
      } else {
        next()
      }
    },
    authSellerAndShop,
    (req, res) => {
      res.json({
        success: true,
        email: req.seller.email,
        role: req.sellerShop.role
      })
    }
  )

  const logoutHandler = (req, res) => {
    if (req.session.sellerId) {
      req.session.destroy(function() {
        res.json({ success: true })
      })
    } else {
      res.json({ success: false })
    }
  }

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

  app.get('/config', authSellerAndShop, authRole('admin'), async (req, res) => {
    const config = await encConf.dump(req.shop.id)
    return res.json({ success: true, config })
  })

  app.post(
    '/config',
    authSellerAndShop,
    authRole('admin'),
    async (req, res) => {
      const config = req.body

      if (!validateConfig(config)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid config data' })
      }

      await encConf.assign(req.shop.id, config)
      return res.json({ success: true })
    }
  )

  app.get('/password', authShop, async (req, res) => {
    const password = await encConf.get(req.shop.id, 'password')
    if (!password) {
      return res.json({ success: true })
    } else if (req.session.authedShop === req.shop.id) {
      return res.json({ success: true })
    }
    res.json({ success: false })
  })

  app.post('/password', authShop, async (req, res) => {
    const password = await encConf.get(req.shop.id, 'password')
    if (req.body.password === password) {
      req.session.authedShop = req.shop.id
      return res.json({ success: true })
    }
    res.json({ success: false })
  })
}
