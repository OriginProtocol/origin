const _growthModels = require('../models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._growthModels, ..._identityModels }
const logger = require('../logger')
const enums = require('../enums')
const crypto = require('crypto')
const { BannedUserError } = require('../util/bannedUserError')

// TODO: have this stored somewhere in the db
const currentAgreementMessage =
  'I accept the terms of growth campaign version: 1.0'

const participantStatusToAuthStatus = {
  [enums.GrowthParticipantStatuses.Active]:
    enums.GrowthParticipantAuthenticationStatus.Enrolled,
  [enums.GrowthParticipantStatuses.Banned]:
    enums.GrowthParticipantAuthenticationStatus.Banned,
  [enums.GrowthParticipantStatuses.Closed]:
    enums.GrowthParticipantAuthenticationStatus.Closed
}

/**
 * Authenticate and enroll the user into the Origin Rewards program.
 * @param {string} accountId - Eth address of the user.
 * @param {string} agreementMessage - Message presented to user to sign.
 * @param {string} signature - Signed message.
 * @param {Object} fingerprintData - Browser fingerprint data.
 * @param {string} ip - IP address the request was initiated from.
 * @param {string} country - 2 letters country code.
 * @returns {Promise<any>}
 */
async function authenticateEnrollment(
  accountId,
  agreementMessage,
  fingerprintData,
  ip,
  country
) {
  if (currentAgreementMessage !== agreementMessage) {
    throw new Error(
      `Incorrect agreementMessage. Expected: "${currentAgreementMessage}" received: "${agreementMessage}"`
    )
  }

  const participant = await db.GrowthParticipant.findOne({
    where: {
      ethAddress: accountId.toLowerCase()
    }
  })

  if (
    participant !== null &&
    participant.status === enums.GrowthParticipantStatuses.Banned
  ) {
    logger.warn(`Banned user: ${accountId} tried to enroll`)
    throw new BannedUserError('This user is banned')
  }

  const authToken =
    participant === null
      ? crypto.randomBytes(64).toString('hex')
      : /* If user uses growth from 2 devices let them share the same auth token.
         * The caveat is user will need to agree to the terms also on the second
         * device.
         */
        participant.authToken

  // Workaround bug causing the mobile app to send fingerprint data
  // as a string rather then an object. See #
  const data =
    typeof fingerprintData === 'string'
      ? JSON.parse(fingerprintData)
      : fingerprintData

  const participantData = {
    ethAddress: accountId.toLowerCase(),
    status: enums.GrowthParticipantStatuses.Active,
    agreementId: agreementMessage,
    authToken: authToken,
    data,
    ip,
    country
  }

  if (participant !== null) {
    await participant.update(participantData)
    logger.info(`Existing user enrolled into growth campaign: ${accountId}`)
  } else {
    await db.GrowthParticipant.create(participantData)
    logger.info(`New user enrolled into growth campaign: ${accountId}`)
  }

  await createInviteCode(accountId)
  return authToken
}

// get user from authentication token
async function getUser(token) {
  return await db.GrowthParticipant.findOne({
    where: {
      authToken: token
    }
  })
}

/**
 * Fetches user's authentication status
 * @param {string} token - Growth authentication token
 * @param {string} accountId - Optional accountId parameter
 *
 * @returns GrowthParticipantAuthenticationStatus
 *  - Enrolled -> user participates in growth campaign
 *  - Banned -> user is banned
 *  - NotEnrolled -> user not a participant yet
 */
async function getUserAuthenticationStatus(token, accountId) {
  if (!token) {
    return enums.GrowthParticipantAuthenticationStatus.NotEnrolled
  }

  const whereFilter = {
    where: {
      authToken: token
    }
  }
  if (accountId !== undefined)
    whereFilter.where.ethAddress = accountId.toLowerCase()

  const growthParticipant = await db.GrowthParticipant.findOne(whereFilter)

  if (growthParticipant === null) {
    return enums.GrowthParticipantAuthenticationStatus.NotEnrolled
  }

  const authStatus = participantStatusToAuthStatus[growthParticipant.status]

  if (!authStatus) {
    throw new Error(
      `Unexpected GrowthParticipant status ${growthParticipant.status}`
    )
  }

  return authStatus
}

/**
 * Fetches user's authentication status and token
 * @param {string} address - ETH address
 *
 * @returns {{
 *  authStatus,
 *  authToken
 * }}
 */
async function getUserAuthStatusAndToken(address) {
  const whereFilter = {
    where: {
      ethAddress: address.toLowerCase()
    }
  }

  const growthParticipant = await db.GrowthParticipant.findOne(whereFilter)

  if (growthParticipant === null) {
    return {
      authToken: null,
      authStatus: enums.GrowthParticipantAuthenticationStatus.NotEnrolled
    }
  }

  const authStatus = participantStatusToAuthStatus[growthParticipant.status]

  if (!authStatus) {
    throw new Error(
      `Unexpected GrowthParticipant status ${growthParticipant.status}`
    )
  }

  return {
    authStatus,
    authToken: growthParticipant.authStatus
  }
}

async function createInviteCode(accountId) {
  accountId = accountId.toLowerCase()
  const existingInvite = await db.GrowthInviteCode.findOne({
    where: {
      ethAddress: accountId
    }
  })

  // don't override the existing invite code
  if (existingInvite !== null) {
    return
  }

  /* Consists of first 3 and last 3 ether address letters plus hex
   * representation of a random number
   *
   * IMPORTANT: Frontend expects 11 letter invite code. Be mindful of that
   * if changing invite code creation logic
   */
  const code =
    `${accountId.substring(2, 5)}` +
    `${accountId.substring(accountId.length - 3, accountId.length)}` +
    `${Math.round(Math.random() * 1000000).toString(16)}`

  await db.GrowthInviteCode.create({
    ethAddress: accountId,
    code
  })

  logger.info(`Invite code: ${code}: created for user: ${accountId}`)
}

module.exports = {
  authenticateEnrollment,
  getUserAuthenticationStatus,
  getUser,
  getUserAuthStatusAndToken
}
