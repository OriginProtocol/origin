const checker = require('@origin/consistency')
const fs = require('fs')
const tmp = require('tmp')
const sendgridMail = require('@sendgrid/mail')
const esmImport = require('esm')(module)
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')
const logger = require('../logger')

function todaysDateString() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth()).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * A job to run consistency checker and send an E-mail with results
 * @param job
 * @returns {Promise<*>}
 */
async function ConsistencyCheckJob(job) {
  logger.info(`Processing ConsistencyCheckJob id=${job.id} data= ${job.data}`)
  job.progress(0)

  if (typeof process.env.EMAILS_TO === 'undefined') {
    throw new Error('Warning: EMAILS_TO env var is not set')
  }
  if (typeof process.env.SENDGRID_API_KEY === 'undefined') {
    throw new Error('Env var SENDGRID_API_KEY must be set')
  }
  if (typeof process.env.SENDGRID_FROM_EMAIL === 'undefined') {
    logger.warn('Warning: SENDGRID_FROM_EMAIL env var is not set')
  }

  const logFile = tmp.fileSync()
  const network = process.env.NETWORK || 'mainnet'

  setNetwork(network)
  if (!contractsContext.web3) {
    throw new Error('web3 not initialized')
  }

  logger.info(`Logging to file ${logFile.name}`)

  const checkCount = await checker.main({
    network,
    web3: contractsContext.web3,
    ipfsGateway: process.env.IPFS_GATEWAY || 'https://ipfs.originprotocol.com',
    fromBlock: network === 'mainnet' ? 6425000 : 0,
    identity: true,
    listings: true,
    offers: true,
    logFile: logFile.name
  })

  logger.info(`${checkCount} checks run`)

  job.progress(90)

  const checkerOutput = await fs.readFileSync(logFile.fd)
  const checkerOutputEncoded = Buffer.from(checkerOutput).toString('base64')

  job.progress(92)

  sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)

  // Assemble the E-mail
  const to = process.env.EMAILS_TO.split(',').map(s => s.trim())
  const dateString = todaysDateString()
  const email = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `Daily data consistency checker results (${dateString}) (${network})`,
    text: `Attached are the results of the ${network} consistency checker run on ${dateString}`,
    attachments: [
      {
        content: checkerOutputEncoded,
        filename: `consistency-report-${network}-${dateString}.log`,
        type: 'plain/text',
        disposition: 'attachment'
      }
    ]
  }

  job.progress(95)

  logger.debug('Sending E-mail...')
  await sendgridMail.send(email)
  logger.debug('E-mail sent.')

  job.progress(100)
  logger.info(`ConsistencyCheckJob id=${job.id} done`)
  return Promise.resolve({ jobDone: true })
}

module.exports = ConsistencyCheckJob
