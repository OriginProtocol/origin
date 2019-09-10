'use strict'

import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { AppRegistry } from 'react-native'

import * as Sentry from '@sentry/react-native'
if (!__DEV__) {
  Sentry.init({
    dsn: 'https://0711315529954f25bb2ee58315fe477b@sentry.io/1399965'
  })
}

import './global'
import App from './src/App'

// Shims required by ethersjs
// https://github.com/ethers-io/ethers.js/issues/304
import 'ethers/dist/shims.js'

AppRegistry.registerComponent('OriginMarketplace', () => App)
