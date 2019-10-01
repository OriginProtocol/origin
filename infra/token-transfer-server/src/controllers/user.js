const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const get = require('lodash.get')

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')

/**
 * Returns the authenticated user.
 */
router.get(
  '/user',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    res.json(req.user)
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
    }
    if (req.body.termsAgreedAt && !req.user.termsAgreedAt) {
      toUpdate.termsAgreedAt = req.body.termsAgreedAt
    }

    await req.user.update(toUpdate)

    res
      .status(200)
      .send(req.user.get({ plain: true }))
      .end()
  })
)

module.exports = router
