const { Grant, Lockup, Transfer, User } = require('../models')
const {
  calculateEarnings,
  calculateLocked,
  calculateNextVestLocked,
  calculateUnlockedEarnings,
  calculateVested,
  calculateWithdrawn,
  getNextVest
} = require('../shared')
const logger = require('../logger')

/**
 * Helper method to check the available balance for a user.
 *
 * @param {BigInt} userId: id ot the user to check the balance for
 * @returns Promise<BigNumber> - available balance
 * @private
 */
async function getBalance(userId) {
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
  // Sum amount withdrawn or pending in transfers
  const transferWithdrawnAmount = calculateWithdrawn(user.Transfers)
  logger.debug(
    `User ${user.email} pending or transferred tokens`,
    transferWithdrawnAmount.toString()
  )

  // Sum locked by lockups
  const lockedAmount = calculateLocked(user.Lockups)
  logger.debug(`User ${user.email} tokens in lockup`, lockedAmount.toString())

  const nextVestLocked = calculateNextVestLocked(user.Lockups)
  logger.debug(
    `User ${user.email} tokens in early lockup`,
    nextVestLocked.toString()
  )

  // Calculate total available tokens
  const available = vested
    .plus(lockupEarnings)
    .minus(transferWithdrawnAmount)
    .minus(lockedAmount)

  if (available.lt(0)) {
    throw new RangeError(`Amount of available OGN is below 0`)
  }

  return available
}

/**
 * Helper method to check the available balance of the next vest for a user. The
 * concept of a balance for the next vest because a user can perform early
 * lockups of tokens from the next vest.
 *
 * @param {BigInt} userId: id ot the user to check the balance for
 * @returns Promise<BigNumber> - available balance on the next vest
 * @private
 */
async function getNextVestBalance(userId) {
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

  const nextVest = getNextVest(
    user.Grants.map(g => g.get({ plain: true })),
    user
  )
  if (!nextVest) {
    logger.debug(`No more vest events for ${user.email}`)
    return 0
  }

  // Sum locked by lockups
  const nextVestLockedAmount = calculateNextVestLocked(user.Lockups)
  logger.debug(
    `User ${user.email} tokens from their next vest in lockup`,
    nextVestLockedAmount.toString()
  )

  return nextVest.amount.minus(nextVestLockedAmount)
}

module.exports = {
  calculateEarnings,
  getBalance,
  getNextVestBalance
}
