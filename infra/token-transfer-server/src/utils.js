const Web3 = require('web3')

const { Account } = require('./models')

/**
 * Allows use of async functions for an Express route.
 */
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const isEthereumAddress = value => {
  if (!Web3.utils.isAddress(value)) {
    throw new Error('Address is not a valid Ethereum address')
  }
  return true
}

const isExistingAddress = (value, { req }) => {
  return Account.findOne({
    where: {
      userId: req.user.id,
      address: value
    }
  }).then(account => {
    if (account) {
      throw new Error('Address already exists')
    }
  })
}

const isExistingNickname = (value, { req }) => {
  return Account.findOne({
    where: {
      userId: req.user.id,
      nickname: value
    }
  }).then(account => {
    if (account) {
      throw new Error('Nickname already exists')
    }
  })
}

module.exports = {
  asyncMiddleware,
  isEthereumAddress,
  isExistingAddress,
  isExistingNickname
}
