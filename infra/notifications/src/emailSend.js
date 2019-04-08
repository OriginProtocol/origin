const Identity = require('./models').Identity
const { getNotificationMessage } = require('./notification')
const fs = require('fs')

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
async function emailSend(eventName, party, buyerAddress, sellerAddress) {

  console.log('✉️ Email Send')
  if (!eventName) throw 'eventName not defined'
  if (!buyerAddress) throw 'buyerAddress not defined'
  if (!sellerAddress) throw 'sellerAddress not defined'


// TODO: Hard-coded for now...

  const recipient = buyerAddress
  const recipientRole = recipient === sellerAddress ? 'seller' : 'buyer'

  const message = getNotificationMessage(
    eventName,
    party,
    recipient,
    recipientRole
  )

  const emails = await Identity.findAll({
    where: {
      ethAddress: buyerAddress
      // ethAddress: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57' //buyerAddress
    }
  })

  console.log(emails)

  // Email templates
  const templateDir = `${__dirname}/../templates`
  const inviteTextTemplate = fs
    .readFileSync(`${templateDir}/emailInvite.txt`)
    .toString()
  const inviteHtmlTemplate = fs
    .readFileSync(`${templateDir}/emailInvite.html`)
    .toString()


  // Filter out redundants before iterating.
  await emails
    .filter((s, i, self) => {
      return self.map(ms => ms.endpoint).indexOf(s.endpoint) === i
    })
    .forEach(async s => {
      try {
        console.log('got one')
        const emailSubject = `An email to ${s.firstName}`
        // const emailBodyText = `Hello there, ${s.firstName}`


        const email = {
          to: s.email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: emailSubject,
          text: inviteTextTemplate,
          html: inviteHtmlTemplate
        }

        try {
          await sendgridMail.send(email)
          console.log(`- Email sent to ${buyerAddress} at ${s.email}`)
        } catch (error) {
          console.error(`Could not email via Sendgrid: ${error}`)
          return res.status(500).send({
            errors: [
              'Could not send email, please try again shortly.'
            ]
          })
        }

      } catch (error) {
        console.error(`Could not email via Sendgrid: ${error}`)
        return res.status(500).send({
          errors: [
            'Could not send email, please try again shortly.'
          ]
        })
      }
    })
}

module.exports = { emailSend }

