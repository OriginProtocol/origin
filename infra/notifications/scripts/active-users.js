require('dotenv').config()

const logger = require('../src/logger')
const db = require('../src/models')

const activeDevices = require('./active-devices.json')
const chunk = require('lodash/chunk')

try {
  require('envkey')
} catch (error) {
  logger.warn('EnvKey not configured. Please set env var ENVKEY')
}

const firebaseMessaging = require('../src/utils/firebaseMessaging')

const run = async () => {
  const activeAccounts = []
  const inactiveAccounts = []

  const chunks = chunk(activeDevices, 500)

  let chunkCount = 0

  for (const chunk of chunks) {
    logger.log(`Processing chunk ${++chunkCount}...`)
    const message = {
      android: {
        priority: 'high',
        notification: {
          channelId: 'Dapp'
        }
      },
      notification: {
        title: 'Test',
        body: 'Test notification'
      },
      tokens: chunk.map(x => x.device_token)
    }
  
    try {
      const { successCount, failureCount, responses } = await firebaseMessaging.sendMulticast(message, true)
      logger.debug('Active devices:', successCount)
      logger.debug('Inactive devices:', failureCount)

      for (let i = 0; i < chunk.length; i++) {
        const resp = responses[i]
        const device = chunk[i]
        if (resp.success) {
          activeAccounts.push(device)
        } else {
          inactiveAccounts.push(device)
        }
      }

      logger.debug('')

    } catch (error) {
      logger.error('FCM message failed to send: ', JSON.stringify(error))
    }
  }

  const _accMap = new Map()
  let dupeCount = 0
  let usAccounts = 0
  const dedupedActiveAccounts = activeAccounts
    .map(acc => {
      if (_accMap.get(acc.eth_address)) {
        dupeCount++
      } else {
        _accMap.set(acc.eth_address, true)

        if ((acc.country || '').toUpperCase() === 'US') {
          usAccounts++
        }
      }
    })

  console.table([
    ['Total devices in registry devices', activeDevices.length],
    ['Active devices (including duplicates)', activeAccounts.length],
    ['Active devices', dedupedActiveAccounts.length],
    ['Active devices (US only)', usAccounts],
  ], ['Metric', 'Device count'])

  process.exit(0)
}

run()
