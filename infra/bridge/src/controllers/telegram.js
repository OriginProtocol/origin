'use strict'

const express = require('express')
const router = express.Router()

const Web3 = require('web3')

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const { generateTelegramCode, verifyTelegramCode } = require('../utils')
const logger = require('../logger')

const { telegramGenerateCode, telegramVerify } = require('../utils/validation')

const { redisClient, getAsync } = require('../utils/redis')

router.get('/generate-code', telegramGenerateCode, async (req, res) => {
  const identity = req.query.identity.toLowerCase()

  const { code, seed } = generateTelegramCode(identity)

  redisClient.set(`telegram/attestation/seed/${identity}`, seed, 'EX', 60 * 30)

  res.send({
    code: code
  })
})

router.post('/verify', telegramVerify, async (req, res) => {
  const identity = req.body.identity.toLowerCase()
  const code = req.body.code

  const eventKey = `telegram/attestation/event/${Web3.utils.sha3(code)}`
  const seedKey = `telegram/attestation/seed/${identity}`

  const storedEvent = await getAsync(eventKey)
  const seed = await getAsync(seedKey)

  if (!storedEvent || !seed) {
    return res
      .status(500)
      .send({
        errors: [`You haven't interacted with the verification bot yet.`]
      })
  }

  const { payload, message } = JSON.parse(storedEvent)

  if (!verifyTelegramCode(identity, payload, seed)) {
    return res
      .status(500)
      .send({
        errors: [`Code verification failed`]
      })
  }

  const userProfileData = message.from
  const profileUrl = userProfileData.username
    ? `https://t.me/${userProfileData.username}`
    : null

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
        raw: profileUrl
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
        profileUrl: profileUrl,
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
