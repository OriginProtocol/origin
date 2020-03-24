const express = require('express')
const router = express.Router()

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')
const {
  lockupBonusRate,
  earlyLockupBonusRate,
} = require('../config')
const {
  getLockupsEnabled,
  getEarlyLockupsEnabled,
  getUnlockDate,
  getOtcRequestEnabled
} = require('../utils')

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
      lockupsEnabled: getLockupsEnabled(),
      earlyLockupsEnabled: getEarlyLockupsEnabled(),
      unlockDate: getUnlockDate(),
      otcRequestEnabled: getOtcRequestEnabled()
    })
  })
)

module.exports = router
