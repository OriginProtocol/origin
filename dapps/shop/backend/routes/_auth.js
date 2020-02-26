const bcrypt = require('bcrypt')
const { PASSWORD_SALT_ROUNDS } = require('../utils/const')

const { Shops } = require('../data/db')

async function createSalt() {
  return await bcrypt.genSalt(PASSWORD_SALT_ROUNDS)
}

async function hashPassword(salt, password) {
  return await bcrypt.hash(password, salt)
}

async function checkPassword(password, passwordHash) {
  return await bcrypt.compare(password, passwordHash)
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

  Shops.findOne({ where: { sellerId, authToken } }).then(shop => {
    if (!shop) {
      return res.status(401).json({ success: false, message: 'Shop not found' })
    }

    req.shop = shop
    next()
  })
}

async function authShop(req, res, next) {
  const authToken = String(req.headers.authorization).split(' ')[1]
  if (!authToken) {
    return res.status(401).json({ success: false, message: 'No auth token' })
  }

  Shops.findOne({ where: { authToken } }).then(shop => {
    if (!shop) {
      return res.status(401).json({ success: false, message: 'Shop not found' })
    }

    req.shop = shop
    next()
  })
}

module.exports = {
  createSalt,
  hashPassword,
  checkPassword,
  authShop,
  authSellerAndShop
}
