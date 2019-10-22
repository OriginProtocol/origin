const moment = require('moment')

const { LOCKUP_REQUEST } = require('../constants/events')
const { Event, Lockup, sequelize } = require('../models')
const { hasBalance } = require('../utils')
const { lockupBonusRate, lockupDuration } = require('../config')
const logger = require('../logger')

/**
 * Adds a lockup
 * @param userId - user id of the user adding the lockup
 * @param amount - the amount to be locked
 * @returns {Promise<Lockup>} Lockup object.
 */
async function addLockup(userId, amount, data = {}) {
  const user = await hasBalance(userId, amount)
  const now = moment.now()

  let lockup
  const txn = await sequelize.transaction()
  try {
    lockup = await Lockup.create({
      userId: user.id,
      start: now,
      end: now.add(lockupDuration, 'months'),
      bonusRate: lockupBonusRate,
      amount,
      data
    })
    await Event.create({
      userId: user.id,
      action: LOCKUP_REQUEST,
      data: JSON.stringify({
        lockupId: lockup.id
      })
    })
    await txn.commit()
  } catch (e) {
    await txn.rollback()
    logger.error(`Failed to add lockup for user ${user.email}: ${e}`)
    throw e
  }

  return lockup
}

module.exports = {
  addLockup
}
