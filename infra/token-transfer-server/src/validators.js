const Web3 = require('web3')
const totp = require('notp').totp

const { Account } = require('./models')
const { decrypt } = require('./lib/crypto')

// Validator for validating an Ethereum address
const isEthereumAddress = value => {
  if (!Web3.utils.isAddress(value)) {
    throw new Error('Address is not a valid Ethereum address')
  }
  return true
}

// Validator for checking if an account address already exists for the user
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
    return true
  })
}

// Validator for checking if an account nickname already exists for the user
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
    return true
  })
}

// Validator for TOTP codes
const isValidTotp = (value, { req }) => {
  if (!req.user.otpKey) {
    throw new Error('No OTP key configured')
  }
  if (!totp.verify(value, decrypt(req.user.otpKey), { window: 1 })) {
    throw new Error('Invalid OTP code')
  }
  return true
}

module.exports = {
  isEthereumAddress,
  isExistingAddress,
  isExistingNickname,
  isValidTotp
}
