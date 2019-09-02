'use strict'

import React, { Component } from 'react'
import { YellowBox } from 'react-native'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Web3 from 'web3'

import Store, { persistor } from './Store'
import AppContainer from './AppContainer'
import NavigationService from './NavigationService'
import setLanguage from 'utils/language'
import { NETWORKS } from './constants'
import { setNetwork } from 'actions/Settings'
import { setAccountActive } from 'actions/Wallet'

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

    // Set the language for the DApp
    setLanguage(settings.language)

    // Validate the network setting
    const networkExists = NETWORKS.find(n => n.name === settings.network.name)
    // If network wasn't found, default to mainnet
    if (!networkExists) {
      await Store.dispatch(setNetwork(NETWORKS.find(n => n.id === 1)))
    }

    // Verify there is a valid active account, and if not set one
    let hasValidActiveAccount = false
    if (wallet.activeAccount) {
      hasValidActiveAccount = wallet.accounts.find(
        a => a.address === wallet.activeAccount.address
      )
    }
    // Setup the active account
    if (!hasValidActiveAccount) {
      const activeAccount = hasValidActiveAccount
        ? wallet.activeAccount
        : wallet.accounts[0]
      Store.dispatch(setAccountActive(activeAccount))
    }

    console.debug(`Found ${wallet.accounts.length} accounts`)

    // Add all the stored accounts to the global web3 object
    for (let i = 0; i < wallet.accounts.length; i++) {
      global.web3.eth.accounts.wallet.add(wallet.accounts[i])
    }
  }

  render() {
    return (
      <ReduxProvider store={Store}>
        <PersistGate onBeforeLift={this.onBeforeLift} persistor={persistor}>
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
