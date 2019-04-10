const Identity = require('./models').Identity
const { getNotificationMessage } = require('./notification')
const fs = require('fs')
const _ = require('lodash') // TODO: (Stan) Cherry pick??

const sendgridMail = require('@sendgrid/mail')
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)
if (!process.env.SENDGRID_API_KEY) {
  console.warn('Warning: SENDGRID_API_KEY env var is not set')
}
if (!process.env.SENDGRID_FROM_EMAIL) {
  console.warn('Warning: SENDGRID_FROM_EMAIL env var is not set')
}

//
// Email notifications
//
async function emailSend(eventName, party, buyerAddress, sellerAddress, offer) {
  console.log('✉️ Email Send')
  if (!eventName) throw 'eventName not defined'
  if (!buyerAddress) throw 'buyerAddress not defined'
  if (!sellerAddress) throw 'sellerAddress not defined'

  console.log(offer.id)

  // Load email template
  const templateDir = `${__dirname}/../templates`

  const emailTemplate = _.template(
    fs.readFileSync(`${templateDir}/emailTemplate.html`).toString()
  )

  const recipient = buyerAddress
  const recipientRole = recipient === sellerAddress ? 'seller' : 'buyer'

  const emails = await Identity.findAll({
    where: {
      ethAddress: buyerAddress
    }
  })

  // Filter out redundants before iterating.
  await emails
    .filter((s, i, self) => {
      return self.map(ms => ms.endpoint).indexOf(s.endpoint) === i
    })
    .forEach(async s => {
      try {
        // console.log(`eventName: ${eventName}`)
        // console.log(`party: ${party}`)
        // console.log(`recipient: ${recipient}`)
        // console.log(`recipientRole: ${recipientRole}`)

        const message = getNotificationMessage(
          eventName,
          party,
          recipient,
          recipientRole
        )

        if (!message) {
          console.warn('No message found.')
          return
        }

        const email = {
          to: s.email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: message.title,
          text: message.body,
          html: emailTemplate({ message: message.body }),
          asm: {
            groupId: 9092
          }
        }

        try {
          await sendgridMail.send(email)
          console.log(`Email sent to ${buyerAddress} at ${s.email}`)
        } catch (error) {
          console.error(`Could not email via Sendgrid: ${error}`)
        }
      } catch (error) {
        console.error(`Could not email via Sendgrid: ${error}`)
      }
    })
}

module.exports = { emailSend }
