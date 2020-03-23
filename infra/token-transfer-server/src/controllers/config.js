const express = require('express')
const router = express.Router()

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')
const {
  lockupBonusRate,
  earlyLockupBonusRate,
  lockupsEnabled,
  earlyLockupsEnabled,
  pageTitle,
  unlockDate
} = require('../config')

/**
 * Returns important config variables required by the client
 */
router.get(
  '/config',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    res.json({
      lockupBonusRate,
      earlyLockupBonusRate,
      lockupsEnabled,
      earlyLockupsEnabled,
      pageTitle,
      unlockDate
    })
  })
)

module.exports = router
