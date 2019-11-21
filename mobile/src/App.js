'use strict'

import React from 'react'
import { YellowBox } from 'react-native'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
// https://github.com/kmagiera/react-native-gesture-handler/issues/320
import 'react-native-gesture-handler'

import Store, { persistor } from './Store'
import AppContainer from './AppContainer'
import NavigationService from './NavigationService'
import setLanguage from 'utils/language'

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup',
  'Setting a timer'
])

const App = () => {
  /* Called after the PersistGate loads the data from redux but before the child
   * components are mounted.
   *
   * Handle some required initialisation for language, web3, and network setting
   * validation.
   */
  const onBeforeLift = async () => {
    const { settings } = Store.getState()
    // Set the language for the DApp
    setLanguage(settings.language)
  }

  return (
    <ReduxProvider store={Store}>
      <PersistGate onBeforeLift={onBeforeLift} persistor={persistor}>
        <AppContainer
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef)
          }}
        />
      </PersistGate>
    </ReduxProvider>
  )
}

export default App
