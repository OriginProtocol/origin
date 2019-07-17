'use strict'

const express = require('express')
const router = express.Router()
const { redisClient } = require('../utils/redis')

const Verification = require('./../models/verfication')
const Attestation = require('./../models/attestation')
const { PromotionTypes, SupportedNetworks, VerificationStatus } = Verification
const { AttestationTypes } = Attestation

// TODO: Add request body validation
router.post('/verify', async (req, res) => {
  const { type, socialNetwork, content, identity } = req.body

  let verificationStatus = Verification.findOne({
    where: {
      ethAddress: identity,
      socialNetwork,
      type,
      content
    }
  })

  if (verificationStatus && verificationStatus.type === PromotionTypes.FOLLOW && verificationStatus.status === VerificationStatus.SHARED) {
    // User has already followed, so skip verification process
    // TODO: What happens with a different content for sharing?
    return res.status(200)
      .send({
        success: true
      })
  } else if (verificationStatus) {
    // User had done this thing before
    await verificationStatus.update({
      status: VerificationStatus.VERIFYING
    })
  } else if (!verificationStatus) {
    // This is the first time the user is trying to verify this
    verificationStatus = await Verification.create({
      ethAddress: identity,
      socialNetwork,
      type,
      content,
      status: VerificationStatus.VERIFYING
    })
  }

  const attestation = await Attestation.findOne({
    ethAddress: identity,
    method: socialNetwork
  })

  if (!attestation) {
    return res.status(400)
      .send({
        success: false,
        errors: [`Attestation missing`]
      })
  }

  // Push this thing to the queue
  redisClient.publish(`${socialNetwork}_VERIFICATION_QUEUE`, JSON.stringify({
    statusId: verificationStatus.id,
    type,
    content,
    identity,
    username: attestation.username,
    tries: 0 // Number of tries so far
  }))

  // Job accepted
  return res.status(202)
    .send({
      success: true
    })
})

module.exports = router
