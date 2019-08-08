'use strict'

const express = require('express')
const router = express.Router()

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const logger = require('../logger')

const { Airgram } = require('airgram')

const airgramInstances = new Map()

function getAirgramInstance(phone) {
  let instance = airgramInstances.get(phone)

  let airgram

  if (!instance) {
    airgram = new Airgram({
      apiId: Number(process.env.TELEGRAM_API_ID),
      apiHash: process.env.TELEGRAM_API_HASH,
      logVerbosityLevel: 0
    })
  } else {
    clearTimeout(instance.timeout)
    airgram = instance.airgram
  }

  airgramInstances.set(phone, {
    airgram,
    timeout: setTimeout(() => {
      airgramInstances.delete(phone)
    }, 30000)
  })

  return airgram
}

// TODO: Add validation
router.post('/generate-code', async (req, res) => {
  const airgram = getAirgramInstance(req.body.phone)

  try {
    const response = await airgram.api.setAuthenticationPhoneNumber({
      phoneNumber: req.body.phone
    })
    if (response.code && response.code > 200) {
      return res.status(500).send({
        errors: [response.message]
      })
    }
  } catch (err) {
    logger.error(err)
    return res.status(500).send({
      errors: ['Something went wrong :(']
    })
  }

  return res.status(200).end()
})

router.post('/verify', async (req, res) => {
  const airgram = getAirgramInstance(req.body.phone)

  let userProfileData

  try {
    let response = await airgram.api.checkAuthenticationCode({
      code: req.body.code
    })
    if (response.code && response.code > 200) {
      return res.status(500).send({
        errors: [response.message]
      })
    }

    userProfileData = await airgram.api.getMe()
  } catch (err) {
    logger.error(err)
    return res.status(500).send({
      errors: ['Something went wrong :(']
    })
  }

  const attestationBody = {
    verificationMethod: {
      oAuth: true
    },
    site: {
      siteName: 'telegram.com',
      userId: {
        raw: String(userProfileData.id)
      },
      username: {
        raw: userProfileData.username
      },
      profileUrl: {
        raw: `https://t.me/@${userProfileData.username}`
      }
    }
  }

  try {
    const attestation = await generateAttestation(
      AttestationTypes.TELEGRAM,
      attestationBody,
      {
        uniqueId: userProfileData.id,
        username: userProfileData.username,
        profileUrl: `https://t.me/@${userProfileData.username}`,
        profileData: userProfileData
      },
      req.body.identity,
      req.ip
    )

    return res.send(attestation)
  } catch (error) {
    logger.error(error)
    return res.status(500).send({
      errors: ['Could not create attestation.']
    })
  }
})

module.exports = router
