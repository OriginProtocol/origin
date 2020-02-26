const { Sellers } = require('../data/db')
const {
  createSalt,
  hashPassword,
  checkPassword
} = require('../routes/_auth')

async function createSeller({ name, email, password }) {
  if (!name || !email || !password) {
    return { status: 400, error: 'Invalid registration' }
  }

  const sellerCheck = await Sellers.findOne({
    where: {
      email
    }
  })

  if (sellerCheck) {
    return { status: 409, error: 'Registration exists' }
  }

  const salt = await createSalt()
  const passwordHash = await hashPassword(salt, password)

  const seller = await Sellers.create({
    name,
    email,
    password: passwordHash
  })

  return { seller }
}

async function findSeller(email) {
  const seller = await Sellers.findOne({ where: { email } })
  return seller
}

async function authSeller(email, password) {
  const seller = await Sellers.findOne({ where: { email } })
  return await checkPassword(password, seller.password)
}

module.exports = { findSeller, createSeller, authSeller }