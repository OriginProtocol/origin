const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const _ = require('lodash')
const base32 = require('thirty-two')
const crypto = require('crypto')
const qrcode = require('qrcode')

const { discordWebhookUrl } = require('../config')
const { postToWebhook } = require('../lib/webhook')
const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware } = require('../utils')
const {
  isValidTotp,
  isRecentlyValidTotp,
  isValidNewTotp
} = require('../validators')
const { encrypt } = require('../lib/crypto')

const {
  Lockup,
  Sequelize: { Op }
} = require('../models')

const logger = require('../logger')

/**
 * Returns the authenticated user.
 */
router.get(
  '/user',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    res.json(
      _.pick(req.user, [
        'email',
        'employee',
        'name',
        'phone',
        'revisedScheduleAgreedAt',
        'revisedScheduleRejected',
        'termsAgreedAt',
        'investorType'
      ])
    )
  })
)

router.post(
  '/user',
  [
    check('phone')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Phone must not be empty'),
    check('revisedScheduleAgreedAt')
      .optional()
      .isRFC3339(),
    check('termsAgreedAt')
      .optional()
      .isRFC3339(),
    check('email')
      .optional()
      .isEmail(),
    check('code')
      .optional()
      .custom(isValidTotp),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const toUpdate = {}
    if (req.body.phone) {
      toUpdate.phone = req.body.phone
    }
    // Terms agreement fields are immutable once set
    if (req.body.revisedScheduleAgreedAt && !req.user.revisedScheduleAgreedAt) {
      toUpdate.revisedScheduleAgreedAt = req.body.revisedScheduleAgreedAt
      // Mark the status as accepted
      toUpdate.revisedScheduleStatus = 'Accepted'
    }
    if (req.body.termsAgreedAt && !req.user.termsAgreedAt) {
      toUpdate.termsAgreedAt = req.body.termsAgreedAt
    }
    if (req.body.email) {
      // Email or 2FA update requires 2FA code
      if (!req.body.code) {
        res
          .status(422)
          .send('Invalid OTP code')
          .end()
        return
      }
      toUpdate.email = req.body.email
    }

    await req.user.update(toUpdate)

    res
      .status(200)
      .send(req.user.get({ plain: true }))
      .end()
  })
)

router.post(
  '/user/otp',
  [
    check('otpKey').optional(),
    check('oldCode').custom(isRecentlyValidTotp),
    check('newCode')
      .optional()
      .custom(isValidNewTotp),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    if (req.body.newCode && req.body.otpKey) {
      // If newCode is in body we are updating the user model with the new
      // OTP key
      const encryptedKey = encrypt(req.body.otpKey)
      // Save
      await req.user.update({ otpKey: encryptedKey, otpVerified: true })
      try {
        if (discordWebhookUrl) {
          const webhookData = {
            embeds: [
              {
                title: `2FA reset by \`${req.user.email}\``
              }
            ]
          }
          await postToWebhook(discordWebhookUrl, JSON.stringify(webhookData))
        }
      } catch (e) {
        logger.error(`Failed sending Discord webhook for 2FA reset:`, e)
      }
      // Nothing to do now, sucessfully reset
      res.send(200).end()
    } else {
      // Received existing OTP code, generate a new key and send it with a QR
      // code that the user can use to verify their setup
      const otpKey = crypto.randomBytes(10).toString('hex')
      const encodedKey = base32.encode(otpKey).toString()
      // Generate QR token for scanning into Google Authenticator
      // https://code.google.com/p/google-authenticator/wiki/KeyUriFormat
      const otpUrl =
        `otpauth://totp/${req.user.email}` +
        `?secret=${encodedKey}` +
        `&period=30` +
        `&issuer=OriginProtocol`
      const otpQrUrl = await qrcode.toDataURL(otpUrl)
      // Send back the QR code and URL back
      res
        .status(200)
        .send({ otpUrl, otpQrUrl, encodedKey, otpKey })
        .end()
    }
  })
)

router.get('/user-stats', async (req, res) => {
  return res.status(200).send({
    userCount: await Lockup.count({
      distinct: true,
      col: 'userId',
      where: {
        end: {
          [Op.gt]: Date.now()
        },
        confirmed: true
      }
    }),
    lockupSum: await Lockup.sum('amount', {
      where: {
        end: {
          [Op.gt]: Date.now()
        },
        confirmed: true
      }
    })
  })
})

module.exports = router
