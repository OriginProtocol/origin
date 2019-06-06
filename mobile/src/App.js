'use strict'

import React, { Component } from 'react'
import { YellowBox } from 'react-native'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Web3 from 'web3'
import Configs from '@origin/graphql/src/configs'

import Store, { persistor } from './Store'
import Loading from 'components/loading'
import AppContainer from './Navigation'
import NavigationService from './NavigationService'
import setLanguage from 'utils/language'
import { loadData, deleteData } from './tools'
import { NETWORKS } from './constants'

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup'
])

class App extends Component {
  constructor(props) {
    super(props)

    // Add web3 to the react-native global object so it is available everywhere
    global.web3 = new Web3()
  }

  /* Called after the PersistGate loads the data from redux but before the child
   * components are mounted.
   *
   * Handle some required initialisation for language, web3, and network setting
   * validation.
   */
  async onBeforeLift() {
    const state = Store.getState()
    const settings = state.settings
    const wallet = state.wallet

    await this._migrateLegacyAccounts()
    await this._migrateLegacyDeviceTokens()

    // Set the language for the DApp
    setLanguage(settings.language)

    // Validate the network setting
    const networkExists = NETWORKS.find(
      n => n.name === settings.network.name
    )

    // If network wasn't found, default to mainnet
    if (!networkExists) {
      await Store.dispatch(NETWORKS.find(n => n.id === 1))
    }

    // Set the web3 provider from the configured network
    const provider = Configs[settings.network.name.toLowerCase()]
    console.debug(`Setting web3 provider to ${provider}`)
    global.web3.setProvider(new Web3.providers.HttpProvider(provider, 20000))

    console.debug(`Found ${wallet.accounts.length} accounts`)

    // Add all the stored accounts to the global web3 object
    for (let i = 0; i < wallet.accounts.length; i++) {
      global.web3.eth.accounts.wallet.add(wallet.accounts[i]);
    }
  }

  /* Move accounts from the old method of storing them into the new redux store
   */
  async _migrateLegacyAccounts() {
    loadData('WALLET_STORE').then(async walletData => {
      if (walletData) {
        for (let i = 0; i < walletData.length; i++) {
          const data = walletData[i]
          if (data.crypt == 'aes' && data.enc) {
            let privateKey
            try {
              privateKey = CryptoJS.AES.decrypt(
                data.enc,
                'WALLET_PASSWORD'
              ).toString(CryptoJS.enc.Utf8)
            } catch (error) {
              console.warn('Failed to decrypt private key, malformed UTF-8?')
              // Try without UTF-8
              privateKey = CryptoJS.AES.decrypt(
                data.enc,
                'WALLET_PASSWORD'
              ).toString()
            }
          }
        }
        deleteData('WALLET_STORE')
      }
    })
  }

  async _migrateLegacyDeviceTokens() {
    loadData('WALLET_INFO').then(async walletInfo => {
      if (walletInfo && walletInfo.deviceToken) {
        Store.dispatch(setDeviceToken(walletInfo.deviceToken))
      }
      deleteData('WALLET_INFO')
    })
  }

  render() {
    return (
      <ReduxProvider store={Store}>
        <PersistGate
          loading={<Loading />}
          onBeforeLift={this.onBeforeLift}
          persistor={persistor}
        >
          <AppContainer
            ref={navigatorRef => {
              NavigationService.setTopLevelNavigator(navigatorRef)
            }}
          />
        </PersistGate>
      </ReduxProvider>
    )
  }
}

export default App
