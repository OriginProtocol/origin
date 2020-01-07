const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

const { discordWebhookUrl, otcPartnerEmails } = require('../config')
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
      .isInt({ min: 250000 })
      .withMessage(
        'OTC requests are only supported for amounts of 250k OGN or larger'
      ),
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

    // Send emails to each of the configured OTC partners
    const vars = {
      amount: req.body.amount,
      action: req.body.action,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      employee: req.user.employee
    }

    for (const email of otcPartnerEmails) {
      logger.info('Sending OTC email to', email)
      await sendEmail(email, 'otc', vars)
    }

    return res.status(204).send('')
  })
)

module.exports = router
