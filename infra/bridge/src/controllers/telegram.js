'use strict'

const express = require('express')
const router = express.Router()

const crypto = require('crypto')
const pick = require('lodash/pick')

const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const { generateAttestation } = require('../utils/attestation')
const logger = require('../logger')

const { telegramVerify } = require('../utils/validation')

const paramToTelegramKeyMapping = {
  authDate: 'auth_date',
  firstName: 'first_name',
  id: 'id',
  lastName: 'last_name',
  photoUrl: 'photo_url',
  username: 'username'
}

function validateHash({ hash, ...body }) {
  // Note: These keys should be sorted in alphabetical order
  // Ref: https://core.telegram.org/widgets/login#checking-authorization
  const keys = [
    'authDate',
    'firstName',
    'id',
    'lastName',
    'photoUrl',
    'username'
  ]

  const data = keys
    .filter(key => typeof body[key] === 'string' && body[key].length)
    .map(key => {
      return `${paramToTelegramKeyMapping[key]}=${body[key]}`
    })
    .join('\n')

  const secret = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest()

  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')

  logger.debug('Comparing hashses...', hash, generatedHash)
  return hash === generatedHash
}

router.post('/verify', telegramVerify, async (req, res) => {
  if (!validateHash(req.body)) {
    logger.error(`Failed to validate hash`, req.body)
    return res.status(400).send({
      errors: ['Failed to create an attestation']
    })
  }

  const userProfileData = pick(req.body, [
    'authDate',
    'firstName',
    'id',
    'lastName',
    'photoUrl',
    'username'
  ])

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
