'use strict'

const { check, validationResult } = require('express-validator/check')

const handleValidationError = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: [
        errors.array()[0].msg
      ]
    })
  } else {
    next()
  }
}

const identityValidation = check('identity')
    .not()
    .isEmpty()
    .withMessage('Field identity must not be empty.')
    .trim()

const airbnbGenerateCode = [
  identityValidation,
 check('airbnbUserId')
    .isInt()
    .withMessage('Field airbnbUserId must be an integer.')
    .isLength({ min: 2 })
    .withMessage('Field airbnbUserId must have length greater than 2.'),
  handleValidationError
]

const airbnbVerifyCode = airbnbGenerateCode

const emailGenerateCode = [
  check('email')
    .not()
    .isEmpty()
    .withMessage('Field email must not be empty.')
    .isEmail()
    .withMessage('Field email is not a valid email address.')
    .trim(),
  handleValidationError
]

const emailVerifyCode = [
  identityValidation,
  check('email')
    .not()
    .isEmpty()
    .withMessage('Field email must not be empty.')
    .isEmail().withMessage('Email is not a valid email address.')
    .trim(),
  check('code')
    .not()
    .isEmpty().withMessage('Field code must not be empty.')
    .trim()
    .toInt(),
  handleValidationError
]

const facebookVerify = [
  identityValidation,
  check('code')
    .not()
    .isEmpty()
    .withMessage('Field code must not be empty.')
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
    .withMessage('Field phone must not be empty.')
    .trim(),
  check('method', 'Invalid phone verification method.')
    .isIn(['sms', 'call'])
    .trim(),
  handleValidationError
]

const phoneVerifyCode = [
  identityValidation,
  check('country_calling_code')
    .not()
    .isEmpty()
    .withMessage('Field country_calling_code must not be empty.')
    .trim(),
  check('phone')
    .not()
    .isEmpty()
    .withMessage('Field phone must not be empty.')
    .trim(),
  check('code')
    .not()
    .isEmpty()
    .withMessage('Field code must not be empty.')
    .trim(),
  handleValidationError
]

const twitterVerifyCode = [
  identityValidation,
  check('oauth-verifier')
    .not()
    .isEmpty()
    .withMessage('Field oauth-verifier must not be empty.'),
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
