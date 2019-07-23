'use strict'

const express = require('express')
const router = express.Router()
const { getAsync } = require('../utils/redis')
const logger = require('./../logger')

const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const { GrowthEventTypes } = require('@origin/growth-event/src/enums')

const { verifyPromotions } = require('../utils/validation')

const { Attestation } = require('./../models/index')

const PromotionEventToGrowthEvent = {
  TWITTER: {
    FOLLOW: GrowthEventTypes.FollowedOnTwitter,
    SHARE: GrowthEventTypes.SharedOnTwitter
  }
}

const waitFor = timeInMs =>
  new Promise(resolve => setTimeout(resolve, timeInMs))

router.post('/verify', verifyPromotions, async (req, res) => {
  const { type, socialNetwork, identity, content } = req.body

  const attestation = await Attestation.findOne({
    where: {
      ethAddress: identity.toLowerCase(),
      method: socialNetwork
    }
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
    const event = await getAsync(redisKey)

    logger.warn(redisKey, event)

    if (event) {
      if (type === 'FOLLOW' || (type === 'SHARE' && event.text === content)) {
        await GrowthEvent.insert(
          logger,
          1,
          identity,
          PromotionEventToGrowthEvent[socialNetwork][type],
          null,
          event,
          Date.now()
        )

        logger.info(
          `${type} event verified for ${identity} on ${socialNetwork}`
        )
        return res.status(200).send({
          success: true
        })
      }
    }

    tries++
  } while (
    tries < maxTries &&
    (await waitFor(process.env.VERIFICATION_POLL_INTERVAL || 1000))
  )

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
