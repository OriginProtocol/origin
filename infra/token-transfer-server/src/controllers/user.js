const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const _ = require('lodash')

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')
const { isValidTotp } = require('../validators')

/**
 * Returns the authenticated user.
 */
router.get(
  '/user',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    res.json(
      _.pick(req.user, [
        'email',
        'employee',
        'name',
        'phone',
        'revisedScheduleAgreedAt',
        'revisedScheduleRejected',
        'termsAgreedAt',
        'investorType'
      ])
    )
  })
)

router.post(
  '/user',
  [
    check('phone')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Phone must not be empty'),
    check('revisedScheduleAgreedAt')
      .optional()
      .isRFC3339(),
    check('termsAgreedAt')
      .optional()
      .isRFC3339(),
    check('email')
      .optional()
      .isEmail(),
    check('code')
      .optional()
      .custom(isValidTotp),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const toUpdate = {}
    if (req.body.phone) {
      toUpdate.phone = req.body.phone
    }
    // Terms agreement fields are immutable once set
    if (req.body.revisedScheduleAgreedAt && !req.user.revisedScheduleAgreedAt) {
      toUpdate.revisedScheduleAgreedAt = req.body.revisedScheduleAgreedAt
      // Mark the status as accepted
      toUpdate.revisedScheduleStatus = 'Accepted'
    }
    if (req.body.termsAgreedAt && !req.user.termsAgreedAt) {
      toUpdate.termsAgreedAt = req.body.termsAgreedAt
    }
    if (req.body.email) {
      // Email update requires 2FA
      if (!req.body.code) {
        res
          .status(422)
          .send('Invalid OTP code')
          .end()
        return
      }
      toUpdate.email = req.body.email
    }

    await req.user.update(toUpdate)

    res
      .status(200)
      .send(req.user.get({ plain: true }))
      .end()
  })
)

module.exports = router
