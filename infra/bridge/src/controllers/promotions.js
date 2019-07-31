'use strict'

const express = require('express')
const router = express.Router()

const crypto = require('crypto')
const Sequelize = require('sequelize')

const { getAsync } = require('../utils/redis')
const logger = require('./../logger')

const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const { GrowthEventTypes } = require('@origin/growth-event/src/enums')

const { verifyPromotions } = require('../utils/validation')

const db = require('../models/index')

const { decodeHTML } = require('../utils/index')

const PromotionEventToGrowthEvent = {
  TWITTER: {
    FOLLOW: GrowthEventTypes.FollowedOnTwitter,
    SHARE: GrowthEventTypes.SharedOnTwitter
  }
}

const waitFor = timeInMs =>
  new Promise(resolve => setTimeout(resolve, timeInMs))

/**
 * Returns user profile data from the event
 */
const getUserProfileFromEvent = ({ event, socialNetwork, type }) => {
  if (socialNetwork !== 'TWITTER') {
    // TODO: As of now, only twitter is supported
    logger.error(`Trying to parse event of unknown network: ${socialNetwork}`)
    return null
  }

  if (type === 'FOLLOW') {
    return event.target
  }

  return event.user
}

/**
 * Creates a growth event for the verified social action.
 *
 * @param {string} content: content that was shared. null for a 'FOLLOW' action.
 * @param {string} identity: eth address of the user
 * @param {Object} event: event sent by social network describing the user action
 * @param {string} socialNetwork:
 * @param {string} type: type of action: 'SHARE' || 'FOLLOW'
 * @returns {Promise<boolean>} Returns true in case of success, false otherwise
 */
const insertGrowthEvent = async ({
  content,
  identity,
  event,
  socialNetwork,
  type
}) => {
  let contentHash = null

  if (content && type === 'SHARE') {
    // Important: Make sure to keep this hash function in sync with
    // the one used in the growth engine rules.
    // See infra/growth/resources/rules.js
    contentHash = crypto
      .createHash('md5')
      .update(content)
      .digest('hex')
  }

  logger.info(`content hash: ${contentHash}`)

  try {
    const twitterProfile = getUserProfileFromEvent({
      event,
      socialNetwork,
      type
    })

    logger.info(`twitterProfile: ${JSON.stringify(twitterProfile)}`)
    await GrowthEvent.insert(
      logger,
      1, // insert a single entry
      identity,
      PromotionEventToGrowthEvent[socialNetwork][type],
      contentHash, // set customId to the content hash.
      // Store the raw event and the profile data that contains the user's social stats in the GrowthEvent.data column.
      // Note: the raw event is mostly for debugging purposes. If it starts taking too much storage
      // we could stop storing it in the DB.
      { event, twitterProfile },
      Date.now()
    )
  } catch (e) {
    logger.error(
      `Failed to store ${type} event for ${identity} on ${socialNetwork}`,
      e
    )
    return false
  }

  logger.info(
    `Logged GrowthEvent. User ${identity} socialNetwork ${socialNetwork} event ${type}`
  )
  return true
}

/**
 * Fetches and returns attestation from db, if exists
 */
const getAttestation = async ({ identity, identityProxy, socialNetwork }) => {
  const addresses = []
  if (identity) {
    addresses.push(identity.toLowerCase())
  }
  if (identityProxy) {
    addresses.push(identityProxy.toLowerCase())
  }

  return await db.Attestation.findOne({
    where: {
      ethAddress: {
        [Sequelize.Op.in]: addresses
      },
      // TODO: This may need a mapping
      method: socialNetwork
    },
    order: [['createdAt', 'DESC']]
  })
}

/**
 * Returns decodedContent (for SHARE) or true (for FOLLOW) if event is what you are looking for, false otherwise
 */
const isEventValid = ({ socialNetwork, type, event, content }) => {
  if (socialNetwork !== 'TWITTER') {
    logger.error(`Trying to parse event of unknown network: ${socialNetwork}`)
    // TODO: As of now, only twitter is supported
    return false
  }

  if (type === 'FOLLOW') {
    return true
  }

  // Note: `event.text` is truncated to 140chars, use `event.extended_tweet.full_text`, if it exists, to get whole tweet content
  // Clone to avoid mutation
  let encodedContent = JSON.parse(
    JSON.stringify(
      event.extended_tweet ? event.extended_tweet.full_text : event.text
    )
  )

  // IMPORTANT: Twitter shortens and replaces URLs
  // we have revert that back to get the original content and to get the hash
  // IMPORTANT: Twitter prepends 'http://' if it idenitifies a text as URL
  // It may result in a different content than expected, So always prepend URLs with `http://` in rule configs.

  const entities = (event.extended_tweet || event).entities
  entities.urls.forEach(entity => {
    encodedContent = encodedContent.replace(entity.url, entity.expanded_url)
  })

  // Invalid if tweet content is not same as expected
  // Note: Twitter sends HTML encoded contents
  const decodedContent = decodeHTML(encodedContent)

  return decodedContent === content ? decodedContent : false
}

router.post('/verify', verifyPromotions, async (req, res) => {
  const { type, socialNetwork, identity, identityProxy, content } = req.body

  logger.info(`Will be polling ${type} event for ${identity} with "${content}"`)

  const attestation = await getAttestation({
    identity,
    identityProxy,
    socialNetwork
  })

  if (!attestation) {
    return res.status(400).send({
      success: false,
      errors: [`Attestation missing`]
    })
  }

  const redisKey = `${socialNetwork.toLowerCase()}/${type.toLowerCase()}/${
    attestation.value
  }`
  const maxTries = process.env.VERIFICATION_MAX_TRIES || 60
  let tries = 0
  do {
    const eventString = await getAsync(redisKey)

    logger.info(`Try ${tries} for ${identity}, ${socialNetwork}, ${type}`)

    logger.info(`GET ${redisKey} ==> ${eventString}`)

    if (eventString) {
      const event = JSON.parse(eventString)

      const decodedContent = isEventValid({
        socialNetwork,
        type,
        event,
        content
      })

      logger.info(`Decoded Content ==> ${decodedContent}`)

      if (decodedContent) {
        const stored = await insertGrowthEvent({
          content: typeof decodedContent === 'string' ? decodedContent : null,
          identity,
          event,
          socialNetwork,
          type
        })

        if (!stored) {
          return res.status(200).send({
            success: false,
            errors: ['Internal error']
          })
        }

        logger.info(
          `${type} event verified for ${identity} on ${socialNetwork}`
        )
        return res.status(200).send({
          success: true
        })
      }
    }

    tries++

    await waitFor(process.env.VERIFICATION_POLL_INTERVAL || 1000)
  } while (tries < maxTries)

  // Request will timeout after 1000ms * 60 === 60s
  logger.error(
    `${type} event verification for ${identity} on ${socialNetwork} timed out`
  )

  return res.status(200).send({
    success: false,
    errors: [`Verification timed out`]
  })
})

/***
 * The following commented code is not in use right now
 * But we might use some of this, if we run into a social network
 * that doesn't support webhooks
 */
// router.post('/verify', async (req, res) => {
//   const { type, socialNetwork, content, identity } = req.body

//   let verificationStatus = Verification.findOne({
//     where: {
//       ethAddress: identity,
//       socialNetwork,
//       type,
//       content
//     }
//   })

//   if (verificationStatus && verificationStatus.type === PromotionTypes.FOLLOW && verificationStatus.status === VerificationStatus.SHARED) {
//     // User has already followed, so skip verification process
//     // TODO: What happens with a different content for sharing?
//     return res.status(200)
//       .send({
//         success: true
//       })
//   } else if (verificationStatus) {
//     // User had done this thing before
//     await verificationStatus.update({
//       status: VerificationStatus.VERIFYING
//     })
//   } else if (!verificationStatus) {
//     // This is the first time the user is trying to verify this
//     verificationStatus = await Verification.create({
//       ethAddress: identity,
//       socialNetwork,
//       type,
//       content,
//       status: VerificationStatus.VERIFYING
//     })
//   }

//   const attestation = await Attestation.findOne({
//     ethAddress: identity,
//     method: socialNetwork
//   })

//   if (!attestation) {
//     return res.status(400)
//       .send({
//         success: false,
//         errors: [`Attestation missing`]
//       })
//   }

//   // Push this thing to the queue
//   redisClient.publish(`${socialNetwork}_VERIFICATION_QUEUE`, JSON.stringify({
//     statusId: verificationStatus.id,
//     type,
//     content,
//     identity,
//     username: attestation.username,
//     tries: 0 // Number of tries so far
//   }))

//   // Job accepted
//   return res.status(202)
//     .send({
//       success: true
//     })
// })

/**
 * Table schema for the commented code above
 */
// return queryInterface.createTable('verification', {
//   id: {
//     allowNull: false,
//     autoIncrement: true,
//     primaryKey: true,
//     type: Sequelize.INTEGER
//   },
//   eth_address: {
//     type: Sequelize.STRING
//   },
//   social_network: {
//     type: Sequelize.ENUM('TWITTER')
//   },
//   type: {
//     type: Sequelize.ENUM('FOLLOW', 'SHARE')
//   },
//   // Content to be shared for "SHARE" type
//   content: {
//     type: Sequelize.STRING
//   },
//   status: {
//     // VERIFYING = Pushed to the queue and polling is in progress to verify
//     // VERIFIED = Public account and everything is OK.
//     // FAILED = Account is protected/private, failed to verify
//     type: Sequelize.ENUM('VERIFYING', 'VERIFIED', 'FAILED'),
//     defaultValue: 'VERIFYING'
//   },
//   // Reason for failure, if status === FAILED
//   reason: {
//     type: Sequelize.STRING
//   },
//   created_at: {
//     type: Sequelize.DATE,
//     allowNull: false,
//     defaultValue: Sequelize.fn('now')
//   },
//   updated_at: {
//     type: Sequelize.DATE,
//     allowNull: false,
//     defaultValue: Sequelize.fn('now')
//   },
//   last_verified: {
//     type: Sequelize.DATE,
//     allowNull: false,
//     defaultValue: Sequelize.fn('now')
//   }
// })

/**
 * Model for the above migration
 */
// module.exports = (sequelize, DataTypes) => {
//   const Verification = sequelize.define(
//     'Verification',
//     {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: DataTypes.INTEGER
//       },
//       ethAddress: {
//         type: DataTypes.STRING
//       },
//       socialNetwork: {
//         type: DataTypes.ENUM('TWITTER')
//       },
//       type: {
//         type: DataTypes.ENUM('FOLLOW', 'SHARE')
//       },
//       // Content to be shared for "SHARE" type
//       content: {
//         type: DataTypes.STRING
//       },
//       status: {
//         // VERIFYING = Pushed to the queue and polling is in progress to verify
//         // VERIFIED = Public account and everything is OK.
//         // FAILED = Account is protected/private, failed to verify
//         type: Sequelize.ENUM('VERIFYING', 'VERIFIED', 'FAILED'),
//         defaultValue: 'VERIFYING'
//       },
//       // Reason for failure, if status === FAILED
//       reason: {
//         type: Sequelize.STRING
//       },
//       last_verified: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.fn('now')
//       }
//     },
//     {
//       tableName: 'verification',
//       timestamps: true
//     }
//   )
//   Verification.PromotionTypes = {
//     FOLLOW: 'FOLLOW',
//     SHARE: 'SHARE'
//   }
//   Verification.SupportedNetworks = {
//     TWITTER: 'TWITTER'
//   }
//   Verification.VerificationStatus = {
//     VERIFYING: 'VERIFYING',
//     VERIFIED: 'VERIFIED',
//     FAILED: 'FAILED'
//   }
//   return Verification
// }

module.exports = router
