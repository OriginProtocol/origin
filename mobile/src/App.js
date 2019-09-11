'use strict'

import React, { useState } from 'react'
import { Platform, Text, YellowBox } from 'react-native'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import RNSamsungBKS from 'react-native-samsung-bks'

import Store, { persistor } from './Store'
import { NETWORKS } from './constants'
import { setNetwork } from 'actions/Settings'
import { setAccounts, setAccountActive } from 'actions/Wallet'
import AppContainer from './AppContainer'
import NavigationService from './NavigationService'
import setLanguage from 'utils/language'
import SamsungBKS from 'components/samsung-bks'

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup',
  'Setting a timer'
])

const enableSamsungBKS = __DEV__

const App = () => {
  const [samsungBKSIsSupported, setSamsungBKSIsSupported] = useState(null)
  const [loading, setLoading] = useState(false)

  /* Called after the PersistGate loads the data from redux but before the child
   * components are mounted.
   *
   * Handle some required initialisation for language, web3, and network setting
   * validation.
   */
  const onBeforeLift = async () => {
    const { samsungBKS, settings, wallet } = Store.getState()

    // Set the language for the DApp
    setLanguage(settings.language)

    // Validate the network setting
    let network = NETWORKS.find(n => n.name === settings.network.name)
    if (!network) {
      network = NETWORKS.find(n => n.id === 1)
    }
    await Store.dispatch(setNetwork(network))

    const filteredAccounts = wallet.accounts.filter(account => {
      // No seed hash or account seed hash matches
      return !account.seedHash || account.seedHash === samsungBKS.seedHash
    })
    console.log(filteredAccounts)
    if (filteredAccounts !== wallet.accounts) {
      await Store.dispatch(setAccounts(filteredAccounts))
    }

    // See if we can (or are) using Samsung BKS and conditionally render the
    // component
    if (Platform.OS === 'android' && enableSamsungBKS) {
      if (wallet.accounts.length === 0 || samsungBKS.seedHash) {
        // No accounts yet, see if Samsung BKS is available
        const samsungBKSIsSupported = await RNSamsungBKS.isSupported()
        if (samsungBKSIsSupported) {
          // Set state flag to render the SamsungBKS component. It will set
          // the loading state to false when it is ready
          setSamsungBKSIsSupported(true)
          return
        }
      }
    }

    onReady()
  }

  const validateActiveAccount = () => {
    const { wallet } = Store.getState()

    // Verify there is a valid active account, and if not set one
    let validActiveAccount = false
    if (wallet.activeAccount) {
      validActiveAccount = wallet.accounts.find(
        a => a.address === wallet.activeAccount.address
      )
    }

    // Setup the active account
    if (!validActiveAccount) {
      Store.dispatch(setAccountActive(wallet.accounts[0]))
    }
  }

  const onReady = () => {
    validateActiveAccount()
    setLoading(false)
  }

  return (
    <ReduxProvider store={Store}>
      <PersistGate onBeforeLift={onBeforeLift} persistor={persistor}>
        {samsungBKSIsSupported && <SamsungBKS onReady={onReady} />}
        {loading ? (
          <Text>Loading</Text>
        ) : (
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

export default App
