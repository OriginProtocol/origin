'use strict'

const { body, validationResult } = require('express-validator')
const Web3Utils = require('web3-utils')

const handleValidationError = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: [errors.array()[0].msg]
    })
  } else {
    next()
  }
}

const payloadValidation = body('payload')
  .exists()
  .withMessage('Field payload must not be empty.')

const signatureValidation = (_, { req }) => {
  if (!req.body.signature) {
    throw new Error('Signature field is required')
  }

  if (!Web3Utils.isHex(req.body.signature)) {
    throw new Error('Signature should be a hex string')
  }

  if (req.body.signature.length !== 132) {
    throw new Error('Invalid signature length' + req.body.signature.length)
  }

  return true
}

const ethAddressValidation = address => {
  if (!Web3Utils.isAddress(address)) {
    throw new Error(`Invalid Eth address ${address}`)
  }
  return true
}

const generateTokenValidation = [
  body('address').custom(ethAddressValidation),
  payloadValidation,
  body('signature').custom(signatureValidation),
  handleValidationError
]

const tokenValidation = body('token')
  .not()
  .isEmpty()
  .withMessage('Field token must not be empty.')
  .trim()

const revokeTokenValidation = [tokenValidation, handleValidationError]

module.exports = {
  generateTokenValidation,
  revokeTokenValidation
}
