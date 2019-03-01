'use strict'

const { check, validationResult } = require('express-validator/check')

const handleValidationError = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: {
        [errors.array()[0].param]: errors.array()[0].msg
      }
    })
  } else {
    next()
  }
}

const airbnbGenerateCode = [
  check('identity')
    .not()
    .isEmpty()
    .withMessage('Must not be empty')
    .trim(),
  check('airbnbUserId')
    .isInt()
    .withMessage('Must be an integer')
    .isLength({ min: 2 })
    .withMessage('must have length greater than 2'),
  handleValidationError
]

const airbnbVerifyCode = airbnbGenerateCode

const emailGenerateCode = [
  check('email')
    .not()
    .isEmpty()
    .withMessage('Must not be empty')
    .isEmail()
    .withMessage('Must be a valid email')
    .trim(),
  handleValidationError
]

const emailVerifyCode = [
  check('identity')
    .not()
    .isEmpty()
    .withMessage('Must not be empty'),
  check('email')
    .not()
    .isEmpty()
    .isEmail()
    .trim(),
  check('code')
    .not()
    .isEmpty()
    .trim(),
  handleValidationError
]

const facebookVerify = [
  check('identity')
    .not()
    .isEmpty()
    .withMessage('Must not be empty'),
  check('code')
    .not()
    .isEmpty()
    .withMessage('Must not be empty')
    .trim(),
  handleValidationError
]

const phoneGenerateCode = [
  check('country_calling_code')
    .not()
    .isEmpty()
    .trim(),
  check('phone')
    .not()
    .isEmpty()
    .withMessage('Must not be empty')
    .trim(),
  check('method', 'Invalid phone verification method')
    .isIn(['sms', 'call'])
    .trim(),
  handleValidationError
]

const phoneVerifyCode = [
  check('identity')
    .not()
    .isEmpty()
    .withMessage('Must not be empty'),
  check('country_calling_code')
    .not()
    .isEmpty()
    .withMessage('Must not be empty')
    .trim(),
  check('phone')
    .not()
    .isEmpty()
    .withMessage('Must not be empty')
    .trim(),
  check('code')
    .not()
    .isEmpty()
    .withMessage('Must not be empty')
    .trim(),
  handleValidationError
]

const twitterVerifyCode = [
  check('identity')
    .not()
    .isEmpty()
    .withMessage('Must not be empty'),
  check('oauth-verifier')
    .not()
    .isEmpty()
    .withMessage('Must not be empty'),
  handleValidationError
]

module.exports = {
  airbnbGenerateCode,
  airbnbVerifyCode,
  emailGenerateCode,
  emailVerifyCode,
  facebookVerify,
  phoneGenerateCode,
  phoneVerifyCode,
  twitterVerifyCode
}
