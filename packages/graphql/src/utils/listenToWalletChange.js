import get from 'lodash/get'

import { getPrimaryAccount } from './primaryAccount'
import sleep from './sleep'
import pubsub from './pubsub'

import createDebug from 'debug'

const debug = createDebug('origin:wallet:update')

function listenToWalletChange() {
  return new Promise(async () => {
    let lastWalletAddress
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await sleep(1000)
      const primaryAccount = await getPrimaryAccount()

      const walletAddress = get(primaryAccount, 'id')

      if (lastWalletAddress !== walletAddress) {
        debug(`Wallet changed from ${lastWalletAddress} to ${walletAddress}`)
        lastWalletAddress = walletAddress

        // Fire event
        pubsub.publish('WALLET_UPDATE', {
          walletUpdate: {
            primaryAccount
          }
        })
      }
    }
  })
}

export default listenToWalletChange
