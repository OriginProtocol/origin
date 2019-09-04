'use strict'

import React, { Component } from 'react'
import { YellowBox } from 'react-native'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Web3 from 'web3'
import RNSamsungBKS from 'react-native-samsung-bks'

import Store, { persistor } from './Store'
import { NETWORKS } from './constants'
import { setNetwork } from 'actions/Settings'
import AppContainer from './AppContainer'
import NavigationService from './NavigationService'
import setLanguage from 'utils/language'
import SamsungBKS from 'components/samsung-bks'

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup'
])

class App extends Component {
  state = {
    samsungBKSIsSupported: null,
    loading: true
  }

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
  onBeforeLift = async () => {
    const { samsungBKS, settings, wallet } = Store.getState()

    // Set the language for the DApp
    setLanguage(settings.language)

    // Validate the network setting
    let network = NETWORKS.find(n => n.name === settings.network.name)
    if (!network) {
      network = NETWORKS.find(n => n.id === 1)
    }
    await Store.dispatch(setNetwork(network))

    global.web3.setProvider(network.provider)

    // See if we can (or are) using Samsung BKS and conditionally render the
    // component
    if (wallet.accounts.length === 0 || samsungBKS.seedHash) {
      // No accounts yet, see if Samsung BKS is available
      const samsungBKSIsSupported = await RNSamsungBKS.isSupported()
      if (samsungBKSIsSupported) {
        // Set state flag to render the SamsungBKS component. It will call
        // onAccountsReady when it is initialized
        this.setState({ samsungBKSIsSupported })
        return
      }
    }

    // Not using Samsung BKS, stop loading
    this.setState({ loading: false })
  }

  render() {
    return (
      <ReduxProvider store={Store}>
        <PersistGate onBeforeLift={this.onBeforeLift} persistor={persistor}>
          {this.state.samsungBKSIsSupported && (
            <SamsungBKS onReady={() => this.setState({ loading: false })} />
          )}
          {!this.state.loading && (
            <AppContainer
              ref={navigatorRef => {
                NavigationService.setTopLevelNavigator(navigatorRef)
              }}
            />
          )}
        </PersistGate>
      </ReduxProvider>
    )
  }
}

export default App
