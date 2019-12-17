const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

const { discordWebhookUrl } = require('../config')
const { sendEmail } = require('../lib/email')
const { postToWebhook } = require('../lib/webhook')
const { asyncMiddleware, getOtcRequestEnabled } = require('../utils')
const { ensureLoggedIn } = require('../lib/login')
const logger = require('../logger')

/**
 * Add a new OTC request.
 */
router.post(
  '/otc',
  [
    check('amount')
      .isNumeric()
      .toInt()
      .isInt({ min: 100 })
      .withMessage('Amount must be 100 or greater'),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    if (!getOtcRequestEnabled()) {
      return res.status(404).end()
    }

    try {
      if (discordWebhookUrl) {
        const webhookData = {
          embeds: [
            {
              title: `An OTC request to \`${req.body.action}\` \`${req.body.amount}\` OGN was created by \`${req.user.email}\``
            }
          ]
        }
        await postToWebhook(discordWebhookUrl, JSON.stringify(webhookData))
      }
    } catch (e) {
      logger.error(`Failed sending Discord webhook for new OTC request`, e)
    }

    const vars = {
      amount: req.body.amount,
      action: req.body.action,
      email: req.user.email
    }
    await sendEmail('investor-relations@originprotocol.com', 'otc', vars)

    return res.status(204).send('')
  })
)

module.exports = router
