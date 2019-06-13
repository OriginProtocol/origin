'use strict'

import React, { Component } from 'react'
import { YellowBox } from 'react-native'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Web3 from 'web3'

import Configs from '@origin/graphql/src/configs'

import Store, { persistor } from './Store'
import AppContainer from './Navigation'
import NavigationService from './NavigationService'
import setLanguage from 'utils/language'
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

    // Set the language for the DApp
    setLanguage(settings.language)

    // Validate the network setting
    const networkExists = NETWORKS.find(n => n.name === settings.network.name)
    // If network wasn't found, default to mainnet
    if (!networkExists) {
      await Store.dispatch(NETWORKS.find(n => n.id === 1))
    }

    // Set the web3 provider from the configured network
    const provider = Configs[settings.network.name.toLowerCase()].provider
    global.web3.setProvider(new Web3.providers.HttpProvider(provider, 20000))
    console.debug(`Set web3 provider to ${provider}`)

    console.debug(`Found ${wallet.accounts.length} accounts`)
    // Add all the stored accounts to the global web3 object
    for (let i = 0; i < wallet.accounts.length; i++) {
      global.web3.eth.accounts.wallet.add(wallet.accounts[i])
    }
  }

  render() {
    return (
      <ReduxProvider store={Store}>
        <PersistGate
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
