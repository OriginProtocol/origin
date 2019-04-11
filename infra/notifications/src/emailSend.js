const Identity = require('./models').Identity
const { getNotificationMessage } = require('./notification')
const fs = require('fs')
const _ = require('lodash') // TODO: (Stan) Cherry pick??
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
async function emailSend(eventName, party, buyerAddress, sellerAddress, offer, listing) {
  console.log('✉️ Email Send')
  if (!eventName) throw 'eventName not defined'
  if (!buyerAddress) throw 'buyerAddress not defined'
  if (!sellerAddress) throw 'sellerAddress not defined'

  // Load email template
  const templateDir = `${__dirname}/../templates`

  const emailTemplate = _.template(
    fs.readFileSync(`${templateDir}/emailTemplate.html`).toString(),
    {imports: {'emailBegin': 'start' ,'emailEnd' : 'end'}}
  )

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
          recipientRole
        )

        if (!message) {
          console.warn('No message found.')
        }
        else {

          const email = {
            to: s.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: message.title,
            text: message.body,
            html: emailTemplate({ message: message.body, listing:listing }),
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
        }

      } catch (error) {
        console.error(`Could not email via Sendgrid: ${error}`)
      }
    })
}

module.exports = { emailSend }
