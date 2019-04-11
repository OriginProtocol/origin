const Identity = require('./models').Identity
const { getNotificationMessage } = require('./notification')
const fs = require('fs')
const _ = require('lodash')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

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
async function emailSend(eventName, party, buyerAddress, sellerAddress, offer, listing, config) {
  console.log('✉️ Email Send')
  if (!eventName) throw 'eventName not defined'
  if (!buyerAddress) throw 'buyerAddress not defined'
  if (!sellerAddress) throw 'sellerAddress not defined'

  // Load email template
  const templateDir = `${__dirname}/../templates`

  const emailBegin = fs.readFileSync(`${templateDir}/emailBegin.html`).toString()
  const emailEnd = fs.readFileSync(`${templateDir}/emailEnd.html`).toString()
  // const emailTemplate = _.template(
  //   fs.readFileSync(`${templateDir}/emailTemplate.html`).toString(),
  //   {imports: {'emailBegin': emailBegin ,'emailEnd' : emailEnd}}
  // )

  console.log('buyerAddress:')
  console.log(buyerAddress)
  console.log('sellerAddress:')
  console.log(sellerAddress)
  console.log('party:')
  console.log(party)
  console.log('-----\n\n')

  const emails = await Identity.findAll({
    where: {
      ethAddress: {
        [Op.or]:  [buyerAddress, sellerAddress, party]
      }
    }
  })

  // Filter out redundants before iterating.
  await emails
    .forEach(async s => {
      try {

        console.log('Checking messages for:')
        console.log(s.ethAddress)

        const recipient = s.ethAddress
        const recipientRole = recipient === sellerAddress ? 'seller' : 'buyer'

        const message = getNotificationMessage(
          eventName,
          party,
          recipient,
          recipientRole,
          'email'
        )

        if (!message) {
          console.warn('No message found.')
        }
        else {

          const email = {
            to: config.overrideEmail || s.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: message.subject,
            text: message.text({ listing:listing }),
            html: emailBegin + message.html({ listing:listing }) + emailEnd,
            asm: {
              groupId: 9092
            }
          }

          try {
            await sendgridMail.send(email)
            console.log(`Email sent to ${buyerAddress} at ${email.to}`)
          } catch (error) {
            console.error(`Could not email via Sendgrid: ${error}`)
          }
        }

      } catch (error) {
        console.error(`Could not email via Sendgrid: ${error}`)
      }
    })
}

module.exports = { emailSend }
