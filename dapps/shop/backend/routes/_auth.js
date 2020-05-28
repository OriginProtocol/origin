const bcrypt = require('bcrypt')
const get = require('lodash/get')

const { Shop, Seller } = require('../models')

const PASSWORD_SALT_ROUNDS = 10

async function createSalt() {
  return await bcrypt.genSalt(PASSWORD_SALT_ROUNDS)
}

async function hashPassword(salt, password) {
  return await bcrypt.hash(password, salt)
}

async function checkPassword(password, passwordHash) {
  return await bcrypt.compare(password, passwordHash)
}

function authRole(role) {
  return function(req, res, next) {
    if (req.sellerShop.role !== role) {
      return res.json({ success: false, error: 'Unauthorized' })
    }
    next()
  }
}

async function authSellerAndShop(req, res, next) {
  const { sellerId } = req.session
  if (!sellerId) {
    return res.status(401).json({ success: false, message: 'Not logged in' })
  }

  req.sellerId = sellerId

  const authToken = String(req.headers.authorization).split(' ')[1]
  if (!authToken) {
    return res.status(401).json({ success: false, message: 'No auth token' })
  }

  const include = { model: Seller, where: { id: sellerId } }
  Shop.findOne({ where: { authToken }, include }).then(shop => {
    if (!shop) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    req.shop = shop
    req.sellerShop = get(shop, 'Sellers[0].SellerShop.dataValues')

    next()
  })
}

async function authSuperUser(req, res, next) {
  if (!req.session.sellerId) {
    return res.status(401).json({ success: false, message: 'Not logged in' })
  }
  const seller = await Seller.findOne({
    where: { id: req.session.sellerId, superuser: true }
  })
  if (!seller) {
    return res.status(401).json({ success: false, message: 'Not logged in' })
  }
  next()
}

async function authShop(req, res, next) {
  const authToken = String(req.headers.authorization).split(' ')[1]
  if (!authToken) {
    return res.status(401).json({ success: false, message: 'No auth token' })
  }

  Shop.findOne({ where: { authToken } }).then(shop => {
    if (!shop) {
      return res.status(401).json({ success: false, message: 'Shop not found' })
    }

    req.shop = shop
    next()
  })
}

async function optionalAuthShop(req, res, next) {
  if (req.headers.authorization) {
    return authShop(req, res, next)
  }
  next()
}

module.exports = {
  createSalt,
  hashPassword,
  checkPassword,
  optionalAuthShop,
  authShop,
  authSellerAndShop,
  authRole,
  authSuperUser
}
