const BigNumber = require('bignumber.js')
const moment = require('moment')
const get = require('lodash.get')
const jwt = require('jsonwebtoken')
const Sequelize = require('sequelize')

const { discordWebhookUrl } = require('../config')
const { sendEmail } = require('../lib/email')
const { postToWebhook } = require('./webhook')
const { LOCKUP_CONFIRMED, LOCKUP_REQUEST } = require('../constants/events')
const { Event, Grant, Lockup, User, sequelize } = require('../models')
const {
  earlyLockupBonusRate,
  lockupBonusRate,
  lockupDuration,
  lockupConfirmationTimeout
} = require('../config')
const { getBalance, getNextVestBalance } = require('./balance')
const { getNextVest, lockupHasExpired } = require('../shared')
const logger = require('../logger')

const { encryptionSecret, clientUrl } = require('../config')

/**
 * Adds a lockup.
 *
 * @param {BigInt} userId - user id of the user adding the lockup
 * @param {BigNumber} amount - the amount to be locked
 * @param {Boolean} early - whether this is an early lockup of the next vest
 * @param {Object} data - additional data to be stored with the lockup, e.g. fingerprint
 * @returns {Promise<Lockup>} Lockup object.
 */
async function addLockup(userId, amount, early, data = {}) {
  const unconfirmedLockups = await Lockup.findAll({
    where: {
      userId: userId,
      confirmed: null, // Unconfirmed
      created_at: {
        [Sequelize.Op.gte]: moment
          .utc()
          .subtract(lockupConfirmationTimeout, 'minutes')
      }
    }
  })

  if (unconfirmedLockups.length > 0) {
    throw new ReferenceError(
      'Unconfirmed lockups exist, please confirm or wait until expiry'
    )
  }

  // Check if user has sufficient balance
  if (early) {
    // This is an early lockup for the next vest so call alternate balance
    // checking function
    const balance = await getNextVestBalance(userId)
    if (BigNumber(amount).gt(balance)) {
      throw new RangeError(
        `Amount of ${amount} OGN exceeds the ${balance} available for early lockup for user ${userId}`
      )
    }

    // Augment lockup data field with additional information about the future
    // vesting event that this lockup is being created for
    const user = await User.findOne({
      where: {
        id: userId
      },
      include: [{ model: Grant }]
    })
    data = {
      ...data,
      vest: getNextVest(
        user.Grants.map(g => g.get({ plain: true })),
        user
      )
    }
  } else {
    // Standard balance check
    const balance = await getBalance(userId)
    if (BigNumber(amount).gt(balance)) {
      throw new RangeError(
        `Amount of ${amount} OGN exceeds the ${balance} available for lockup for user ${userId}`
      )
    }
  }

  let lockup
  const txn = await sequelize.transaction()
  try {
    lockup = await Lockup.create({
      userId: userId,
      start: moment.utc(), // Note lockup starts immediately not at time of next vest
      end: moment.utc().add(lockupDuration, 'months'),
      bonusRate: early ? earlyLockupBonusRate : lockupBonusRate,
      amount,
      data
    })
    await Event.create({
      userId: userId,
      action: LOCKUP_REQUEST,
      data: JSON.stringify({
        lockupId: lockup.id
      })
    })
    await txn.commit()
  } catch (e) {
    await txn.rollback()
    logger.error(`Failed to add lockup for user ${userId}: ${e}`)
    throw e
  }

  await sendLockupConfirmationEmail(lockup, userId)

  return lockup
}

/**
 * Sends an email with a token that can be used for confirming a lockup.
 *
 * @param lockup - the lockup object
 * @param userId - id of the user to email
 */
async function sendLockupConfirmationEmail(lockup, userId) {
  const user = await User.findByPk(userId)

  const token = jwt.sign(
    {
      lockupId: lockup.id
    },
    encryptionSecret,
    { expiresIn: `${lockupConfirmationTimeout}m` }
  )

  const vars = {
    url: `${clientUrl}/lockup/${lockup.id}/${token}`,
    employee: user.employee
  }

  await sendEmail(user.email, 'lockup', vars)

  logger.info(
    `Sent email lockup confirmation token to ${user.email} for lockup ${lockup.id}`
  )
}

/** Moves a lockup from waiting for email confirmation to confirmed.
 * Throws an exception if the request is invalid.
 * @param lockup
 * @param user
 */
async function confirmLockup(lockup, user) {
  if (lockup.confirmed) {
    throw new Error('Lockup is already confirmed')
  }

  if (lockupHasExpired(lockup)) {
    throw new Error('Lockup was not confirmed in the required time')
  }

  const txn = await sequelize.transaction()
  try {
    await lockup.update({
      confirmed: true
    })
    const event = {
      userId: user.id,
      action: LOCKUP_CONFIRMED,
      data: JSON.stringify({
        lockupId: lockup.id
      })
    }
    await Event.create(event)
    await txn.commit()
  } catch (e) {
    await txn.rollback()
    logger.error(
      `Failed writing confirmation data for lockup ${lockup.id}: ${e}`
    )
    throw e
  }

  try {
    if (discordWebhookUrl) {
      const countryDisplay = get(lockup.data.location, 'countryName', 'Unknown')
      const webhookData = {
        embeds: [
          {
            title: `A lockup of \`${lockup.amount}\` OGN was created by \`${user.email}\``,
            description: [
              `**ID:** \`${lockup.id}\``,
              `**Country:** ${countryDisplay}`
            ].join('\n')
          }
        ]
      }
      await postToWebhook(discordWebhookUrl, JSON.stringify(webhookData))
    }
  } catch (e) {
    logger.error(
      `Failed sending Discord webhook for token lockup confirmation:`,
      e
    )
  }

  return true
}

module.exports = {
  addLockup,
  confirmLockup
}
