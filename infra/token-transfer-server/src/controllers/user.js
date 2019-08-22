const express = require('express')
const router = express.Router()

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
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    if (req.body.phone) {
      await req.user.update({ phone: req.body.phone })
    }
    res.status(200).end()
  })
)

module.exports = router
