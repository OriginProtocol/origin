const BigNumber = require('bignumber.js')

const { Grant, Lockup, Transfer, User } = require('../models')
const {
  calculateVested,
  calculateUnlockedEarnings,
  calculateWithdrawn,
  calculateLocked,
  calculateEarnings
} = require('../shared')
const logger = require('../logger')

/**
 * Helper method to check if a user has balance available for adding a transfer
 * or a lockup.
 *
 * Throws an exception in case the request is invalid.
 *
 * @param userId
 * @param amount
 * @paraam currentTransferId
 * @returns Promise<User>
 * @private
 */
async function hasBalance(userId, amount, currentTransferId = null) {
  const user = await User.findOne({
    where: {
      id: userId
    },
    include: [{ model: Grant }, { model: Transfer }, { model: Lockup }]
  })
  // Load the user and check there enough tokens available to fulfill the
  // transfer request
  if (!user) {
    throw new Error(`Could not find specified user id ${userId}`)
  }

  // Sum the vested tokens for all of the users grants
  const vested = calculateVested(user, user.Grants)
  logger.debug(`User ${user.email} vested tokens`, vested.toString())
  // Sum the unlocked tokens from lockup earnings
  const lockupEarnings = calculateUnlockedEarnings(user.Lockups)
  logger.debug(
    `User ${user.email} unlocked earnings from lockups`,
    lockupEarnings.toString()
  )
  // Sum amount withdrawn or pending in transfers excluding the current transfer
  // if provided (balance check while exeucting transfer)
  const transferWithdrawnAmount = calculateWithdrawn(
    user.Transfers.filter(t => t.id !== currentTransferId)
  )
  logger.debug(
    `User ${user.email} pending or transferred tokens`,
    transferWithdrawnAmount.toString()
  )
  // Sum locked by lockups
  const lockedAmount = calculateLocked(user.Lockups)
  logger.debug(`User ${user.email} tokens in lockup`, lockedAmount.toString())

  // Calculate total available tokens
  const available = vested
    .plus(lockupEarnings)
    .minus(transferWithdrawnAmount)
    .minus(lockedAmount)

  if (available.lt(0)) {
    throw new RangeError(`Amount of available OGN is below 0`)
  }

  if (BigNumber(amount).gt(available)) {
    throw new RangeError(
      `Amount of ${amount} OGN exceeds the ${available} available for ${user.email}`
    )
  }

  return user
}

module.exports = {
  calculateEarnings,
  hasBalance
}
