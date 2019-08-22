const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

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
      .not()
      .isEmpty()
      .withMessage('Phone must not be empty'),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    if (req.body.phone) {
      await req.user.update({ phone: req.body.phone })
    }
    res.status(200).end()
  })
)

module.exports = router
