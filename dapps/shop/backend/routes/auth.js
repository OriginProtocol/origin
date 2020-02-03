const { Sellers, Shops } = require('../data/db')
const {
  createSalt,
  hashPassword,
  AuthSeller,
  authenticated,
  authenticatedAsSeller
} = require('./_combinedAuth')
const { IS_PROD } = require('../utils/const')
const encConf = require('../utils/encryptedConfig')
const { validateConfig, validateShop } = require('../utils/validators')

module.exports = function(app) {
  app.get('/auth', (req, res) => {
    res.json({ success: req.isAuthenticated() })
  })

  app.get('/auth/:email', async (req, res) => {
    // TODO: Add some rate limiting here
    const seller = await Sellers.findOne({
      where: {
        email: req.params.email
      }
    })
    const statusCode = seller !== null ? 204 : 404
    res.status(statusCode)
  })

  app.post(
    '/auth/login',
    (req, res, next) => {
      return next()
    },
    AuthSeller,
    (req, res) => {
      res.status(204)
    }
  )

  // TODO: Should this at least use API key auth?
  app.post('/auth/registration', async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration'
      })
    }

    const sellerCheck = await Sellers.findOne({
      where: {
        email
      }
    })

    if (sellerCheck) {
      return res.status(409).json({ message: 'Registration exists' })
    }

    const salt = await createSalt()
    const passwordHash = await hashPassword(salt, password)

    const seller = await Sellers.create({
      name,
      email,
      password: passwordHash
    })

    return res.status(204)
  })

  app.delete('/auth/registration', authenticatedAsSeller, async (req, res) => {
    const { id } = req.user

    if (!id) {
      return res.status(400)
    }

    const destroy = await Sellers.destroy({
      where: {
        id
      }
    })

    res.status(204)
  })

  app.post('/shop', authenticatedAsSeller, async (req, res) => {
    const shopObj = req.body

    if (!validateShop(shopObj)) {
      return res
        .status(400)
        .json({ message: 'Invalid shop data' })
    }

    const shop = await Shops.create({
      ...shopObj,
      seller_id: req.user.id
    })

    res.json(shop)
  })

  app.delete('/shop', authenticatedAsSeller, async (req, res) => {
    await Shops.destroy({
      where: {
        id: req.body.id,
        seller_id: req.user.id
      }
    })
    res.json({ success: true })
  })

  app.post('/config', authenticatedAsSeller, async (req, res) => {
    const { shopId, config } = req.body

    const shop = await Shops.findOne({
      where: {
        id: shopId,
        seller_id: req.user.id
      }
    })

    if (!shop) {
      return res.status(400).json({ message: 'Shop not found' })
    }

    if (!validateConfig(config)) {
      // TODO add error return describing why invalid
      return res
        .status(400)
        .json({ message: 'Invalid config data' })
    }

    console.log('config to update: ', config)

    await encConf.assign(shopId, config)

    return res.status(204)
  })

  app.get('/config/dump/:id', authenticatedAsSeller, async (req, res) => {
    const { id: shopId } = req.params

    // Testing only
    if (IS_PROD) return res.sendStatus(404)

    const shop = await Shops.findOne({
      where: {
        id: shopId,
        seller_id: req.user.id
      }
    })

    if (!shop) {
      return res.status(404)
    }

    const config = await encConf.dump(shopId)
    res.json(config)
  })
}
