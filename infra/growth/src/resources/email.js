const fs = require('fs')
const sendgridMail = require('@sendgrid/mail')
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)
const validator = require('validator')

const _growthModels = require('../models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._growthModels, ..._identityModels }
const enums = require('../enums')
const logger = require('../logger')

// Do not allow referrer to blast invites to more than maxNumInvites recipients.
const maxNumInvites = 50

// Email templates.
const templateDir = `${__dirname}/../templates`
const inviteTextTemplate = fs
  .readFileSync(`${templateDir}/emailInvite.txt`)
  .toString()
const inviteHtmlTemplate = fs
  .readFileSync(`${templateDir}/emailInvite.html`)
  .toString()
const reminderTextTemplate = fs
  .readFileSync(`${templateDir}/emailReminder.txt`)
  .toString()
const reminderHtmlTemplate = fs
  .readFileSync(`${templateDir}/emailReminder.html`)
  .toString()

/**
 * Returns the content for invite email.
 * TODO: localize the content.
 *
 * @param {string} emailType: 'invite' or 'reminder'
 * @param {string} friendName
 * @param {string} targetUrl
 * @returns {{subject: string, html: *, text: *}}
 */
function generateEmail(emailType, referrerName, targetUrl) {
  let subject, textTemplate, htmlTemplate
  if (emailType === 'invite') {
    subject = 'Join Origin and earn free cryptocurrency'
    textTemplate = inviteTextTemplate
    htmlTemplate = inviteHtmlTemplate
  } else {
    subject = 'Earn Origin cryptocurrency'
    textTemplate = reminderTextTemplate
    htmlTemplate = reminderHtmlTemplate
  }
  const text = textTemplate
    .replace(/\${referrerName}/g, referrerName)
    .replace(/\${targetUrl}/g, targetUrl)
  const html = htmlTemplate
    .replace(/\${referrerName}/g, referrerName)
    .replace(/\${targetUrl}/g, targetUrl)
    .replace(
      /\${referrerImgUrl}/g,
      'https://www.originprotocol.com/static/img/unknown-user.png'
    )

  return { subject, text, html }
}

/**
 * Loads values for variables used in email templates.
 *
 * @param {string}referrer - wallet address of the referrer.
 * @returns {Promise<{referrerName: string, targetUrl: string}>}
 * @private
 */
async function _getEmailVars(referrer) {
  // Load the invite code for the referrer.
  const inviteCode = await db.GrowthInviteCode.findOne({
    where: { ethAddress: referrer.toLowerCase() }
  })
  if (!inviteCode) {
    throw new Error(`No invite code for ${referrer}`)
  }

  // Load the referrer's identity to get their name.
  const identity = await db.Identity.findOne({
    where: { ethAddress: referrer.toLowerCase() }
  })
  if (!identity) {
    throw new Error(`Failed loading identity for ${referrer}`)
  }
  const referrerName =
    (identity.firstName || '') + ' ' + (identity.lastName || '')

  const dappUrl = process.env.DAPP_URL || 'http://localhost:3000'
  const targetUrl = `${dappUrl}/#/welcome/${inviteCode.code}`

  return { referrerName, targetUrl }
}

/**
 * Send invite codes by email.
 *
 * @param {string} referrer - Eth address of the referrer.
 * @param {Array<string>>} recipients - List of email addresses.
 * @returns {Promise<void>}
 */
async function sendInvites(referrer, recipients) {
  if (recipients.length > maxNumInvites) {
    throw new Error(`Exceded number of invites limit.`)
  }
  logger.info(
    `Sending ${recipients.length} invitation emails on behalf of ${referrer}`
  )

  const { referrerName, targetUrl } = await _getEmailVars(referrer)

  for (const recipient of recipients) {
    // Validate recipient is a proper email.
    if (!validator.isEmail(recipient)) {
      logger.error(`Skipping sending invite to invalid email ${recipient}`)
      continue
    }

    // Send the invite code to the recipient.
    const { subject, text, html } = generateEmail(
      'invite',
      referrerName,
      targetUrl
    )
    const email = {
      to: recipient,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text,
      html
    }
    try {
      await sendgridMail.send(email)
    } catch (error) {
      logger.error(`Failed sending invite: ${error}`)
      throw new Error(`Failed sending invite: ${error}`)
    }

    // Make sure the entry is not a duplicate then
    // record an entry in the growth_invite table.
    const existing = await db.GrowthInvite.findOne({
      where: {
        referrerEthAddress: referrer.toLowerCase(),
        refereeContactType: enums.GrowthInviteContactTypes.Email,
        refereeContact: recipient
      }
    })
    if (!existing) {
      await db.GrowthInvite.create({
        referrerEthAddress: referrer.toLowerCase(),
        refereeContactType: enums.GrowthInviteContactTypes.Email,
        refereeContact: recipient,
        status: enums.GrowthInviteStatuses.Sent
      })
    }
    logger.info('Invites sent and recorded in DB.')
  }
}

/**
 * Sends a reminder email.
 *
 * @param {string} referrer - Wallet address of referrer.
 * @param {string} inviteId - growth_invite.id
 * @returns {Promise<void>}
 */
async function sendInviteReminder(referrer, inviteId) {
  // Load the invite and do some checks.
  const invite = await db.GrowthInvite.findOne({
    where: {
      id: inviteId,
      referrerEthAddress: referrer.toLowerCase()
    }
  })
  if (!invite) {
    throw new Error(`No invite with id ${inviteId} for referrer ${referrer}`)
  }
  if (invite.refereeContactType !== enums.GrowthInviteContactTypes.Email) {
    logger.error('Can only send reminder by email for now.')
    return
  }

  logger.info(`Sending reminder email on behalf of ${referrer}`)
  const { referrerName, targetUrl } = await _getEmailVars(referrer)
  const recipient = invite.refereeContact

  // Send the reminder email.
  const { subject, text, html } = generateEmail(
    'reminder',
    referrerName,
    targetUrl
  )
  const email = {
    to: recipient,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text,
    html
  }
  try {
    await sendgridMail.send(email)
  } catch (error) {
    logger.error(`Failed sending reminder: ${error}`)
    throw new Error(`Failed sending reminder: ${error}`)
  }
}

module.exports = { generateEmail, sendInvites, sendInviteReminder }
