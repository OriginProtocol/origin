const _growthModels = require('../models')
const _identityModels = require('origin-identity/src/models')
const db = { ..._growthModels, ..._identityModels }
const logger = require('../logger')
const Web3 = require('web3')
const enums = require('../enums')
const crypto = require('crypto')

const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545')
// TODO: have this stored somewhere in the db
const currentAgreementMessage =
  'I accept the terms of growth campaign version: 1.0'

/**
 * Authenticates user's enrollment to the growth campaign
 * @param {string} referrer - Eth address of the referrer.
 * @param {Array<string>>} recipients - List of email addresses.
 */
async function authenticateEnrollment(accountId, agreementMessage, signature) {
  if (currentAgreementMessage !== agreementMessage) {
    throw new Error(
      `Incorrect agreementMessage. Expected: "${currentAgreementMessage}" received: "${agreementMessage}"`
    )
  }
  const recoveredAccountId = web3.eth.accounts.recover(
    agreementMessage,
    signature
  )

  if (accountId !== recoveredAccountId) {
    throw new Error('Recovered and provided accounts do not match')
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
    throw new Error('This user is banned')
  }

  const authToken =
    participant === null
      ? crypto.randomBytes(64).toString('hex')
      : /* If user uses growth from 2 devices let them share the same auth token.
         * The caveat is user will need to agree to the terms also on the second
         * device.
         */
        participant.authToken

  const participantData = {
    ethAddress: accountId.toLowerCase(),
    status: enums.GrowthParticipantStatuses.Active,
    agreementId: agreementMessage,
    authToken: authToken
  }

  console.log("PARTICIPANT DATA: ", JSON.stringify(participantData))

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
  return await db.GrowthParticipant.findOne({ where: {
    authToken: token
  }})
}

/**
 * Fetches user's authentication status
 * @param {string} token - Growth authentication token
 * @param {string} accountId - Optional accountIOd parameter
 *
 * returns GrowthParticipantAuthenticationStatus
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
  } else if (
    growthParticipant.status === enums.GrowthParticipantStatuses.Banned
  ) {
    return enums.GrowthParticipantAuthenticationStatus.Banned
  } else {
    return enums.GrowthParticipantAuthenticationStatus.Enrolled
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

module.exports = { authenticateEnrollment, getUserAuthenticationStatus, getUser }
