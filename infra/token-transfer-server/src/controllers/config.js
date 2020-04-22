const express = require('express')
const router = express.Router()
const moment = require('moment')

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')
const {
  lockupBonusRate,
  earlyLockupBonusRate,
  earlyLockupsEnabledUntil
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
      earlyLockupsEnabledUntil,
      earlyLockupsEnabled: getEarlyLockupsEnabled(),
      unlockDate: getUnlockDate(),
      isLocked: moment.utc() < moment.utc(getUnlockDate()),
      otcRequestEnabled: getOtcRequestEnabled()
    })
  })
)

module.exports = router
