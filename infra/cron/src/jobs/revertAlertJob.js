/**
 * This uses etherscan to look for reverts we might want to know about
 *
 * TODO: Make this more intelligent.  Break down the transactions, figure out
 * the methods that failed, etc.
 */
const fetch = require('cross-fetch')
const sendgridMail = require('@sendgrid/mail')
const esmImport = require('esm')(module)

const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')
const logger = require('../logger')

const net = process.env.NETWORK || 'mainnet'

const contractsJson = esmImport(`@origin/contracts/build/contracts_${net}.json`)

const API_ENDPOINT =
  net === 'mainnet'
    ? 'https://api.etherscan.io/api'
    : 'https://etherscan.io/apis#accounts'
const DAILY_BLOCKS = 5760 // (24 * 60 * 60) / 15

/**
 * Get transactions from etherscan
 *
 * @param {string} address of contract to check
 * @param {object} options
 * @param {string} options.action - The "action" to call in the API
 * @param {string} options.fromBlock - The start of the block range to search
 * @param {string} options.apiKey - The etherscan API key to use
 * @returns {Array} of etherscan transaction objects
 */
async function fetchTransactions(address, options) {
  const { action = 'txlist', fromBlock, endBlock, apiKey } = options
  const url = `${API_ENDPOINT}?module=account&action=${action}&address=${address}&startblock=${fromBlock}&endblock=${endBlock}&sort=desc&apikey=${apiKey}`

  logger.debug(`Fetching ${url}`)

  const res = await fetch(url)

  if (res.status !== 200) {
    throw new Error('Unable to query etherscan')
  }

  const jason = await res.json()

  if (!jason.status) {
    throw new Error('Query to etherscan failed. Invalid resposne.')
  }

  return jason.result
}

/**
 * Returns a date string in ISO8601
 * @returns {string} today's date
 */
function todaysDateString() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth()).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function block24HoursAgo(blockNumber) {
  return blockNumber - DAILY_BLOCKS
}

async function RevertAlertJob(job) {
  logger.info(`Processing RevertAlertJob id=${job.id} data= ${job.data}`)
  job.progress(0)

  if (!['mainnet', 'rinkeby'].includes(net)) {
    job.progress(100)
    return { jobDone: false }
  }

  if (typeof process.env.ETHERSCAN_API_KEY === 'undefined') {
    throw new Error('Env var ETHERSCAN_API_KEY must be set')
  }
  if (typeof process.env.EMAILS_TO === 'undefined') {
    throw new Error('Warning: EMAILS_TO env var is not set')
  }
  if (typeof process.env.SENDGRID_API_KEY === 'undefined') {
    throw new Error('Env var SENDGRID_API_KEY must be set')
  }
  if (typeof process.env.SENDGRID_FROM_EMAIL === 'undefined') {
    logger.warn('Warning: SENDGRID_FROM_EMAIL env var is not set')
  }

  job.progress(5)

  setNetwork(net)
  if (!contractsContext.web3) {
    throw new Error('web3 not initialized')
  }

  const latestBlock = await contractsContext.web3.eth.getBlockNumber()
  const yesterdaysBlock = block24HoursAgo(latestBlock)

  job.progress(10)

  sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)

  const apiKey = process.env.ETHERSCAN_API_KEY

  let total = 0
  const reverts = []
  const contracts = []
  contracts.push({
    address: contractsJson['Marketplace'],
    epoch: contractsJson['MarketplaceEpoch']
  })
  if (contractsJson['Marketplace_V01']) {
    contracts.push({
      address: contractsJson['Marketplace_V01'],
      epoch: contractsJson['MarketplaceEpoch_V01']
    })
  }

  job.progress(30)

  for (const c of contracts) {
    const { address, epoch } = c
    const fromBlock = Math.max(epoch, yesterdaysBlock)

    const transactions = await fetchTransactions(address, {
      fromBlock,
      endBlock: latestBlock,
      apiKey
    })

    for (const tx of transactions) {
      total += 1
      if (tx.txreceipt_status !== '1') {
        reverts.push(tx.hash)
      }
    }

    const internals = await fetchTransactions(c.address, {
      action: 'txlistinternal',
      fromBlock,
      apiKey
    })

    for (const tx of internals) {
      total += 1
      if (tx.isError === '1') {
        reverts.push(tx.hash)
      }
    }
  }

  // test revert
  // reverts.push('0xdeadbeef')

  if (reverts.length === 0) {
    logger.info('No E-mail to send, no reverts.')
    job.progress(100)
    return { jobDone: true }
  }

  const to = process.env.EMAILS_TO.split(',').map(s => s.trim())
  const dateString = todaysDateString()
  const email = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `Transaction reverts report (${dateString}) (${net})`,
    text: `We found ${
      reverts.length
    } total reverts in the last ${total} transactions.\n\n${reverts.join('\n')}`
  }

  job.progress(90)

  logger.debug('Sending E-mail...')
  await sendgridMail.send(email)
  logger.debug('E-mail sent.')

  job.progress(100)
  return { jobDone: true }
}

module.exports = RevertAlertJob
