'use strict'

import React, { Component } from 'react'
import { YellowBox } from 'react-native'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import Store, { persistor } from './Store'
import OriginWallet from './OriginWallet'
import Loading from 'components/loading'
import AppContainer from './Navigation'
import NavigationService from './NavigationService'
import setLanguage from 'utils/language'

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup'
])

class App extends Component {
  onBeforeLift() {
    setLanguage(Store.getState().settings.language)
  }

  render() {
    return (
      <ReduxProvider store={Store}>
        <PersistGate
          loading={<Loading />}
          onBeforeLift={this.onBeforeLift}
          persistor={persistor}
        >
          <OriginWallet />
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
