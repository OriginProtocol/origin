const sendgridMail = require('@sendgrid/mail')
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)
const validator = require('validator')

const _growthModels = require('../models')
const _identityModels = require('origin-identity/src/models')
const db = { ..._growthModels, ..._identityModels }
const logger = require('../logger')

/**
 * Send invite codes by email.
 * @param {string} referrer - Eth address of the referrer.
 * @param {Array<string>>} recipients - List of email addresses.
 */
async function sendInvites(referrer, recipients) {
  // Load the invite code for the referrer.
  const code = db.GrowthInviteCode.findOne({
    where: { ethAddress: referrer.toLowerCase() }
  })
  if (!code) {
    throw new Error(`No invite code for ${referrer}`)
  }

  // Load the referrer's identity to get their name.
  const identity = await db.Identity.findOne({
    where: { ethAddress: referrer.toLowerCase() }
  })
  if (!identity) {
    throw new Error(`Failed loading identity for ${referrer}`)
  }
  const contactName =
    (identity.firstName || '') + ' ' + (identity.lastName || '')

  for (const recipient of recipients) {
    // Validate recipient is a proper email.
    if (!validator.isEmail(recipient)) {
      logger.error(`Skipping sending invite to invalid email ${recipient}`)
      continue
    }

    // Send the invite code to the recipient.
    // TODO: should we have an html version of the email ?
    const email = {
      to: recipient,
      from: process.env.INVITE_FROM_EMAIL,
      subject: `${contactName} invited you to join Origin`,
      text: `Check it out at https://dapp.originprotocol.com/invite/${code}.`
    }
    try {
      await sendgridMail.send(email)
    } catch (error) {
      logger.error(`Failed sending invite: ${error}`)
      throw new Error(`Failed sending invite: ${error}`)
    }
  }
}

module.exports = { sendInvites }
