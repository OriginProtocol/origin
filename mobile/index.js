'use strict'

import '@babel/polyfill'

import { AppRegistry } from 'react-native'

import { Sentry } from 'react-native-sentry'
if (!__DEV__) {
  Sentry.config(
    'https://0711315529954f25bb2ee58315fe477b@sentry.io/1399965'
  ).install()
}

import './global'
import App from './src/App'

// Shims required by ethersjsA
// https://github.com/ethers-io/ethers.js/issues/304
import 'ethers/dist/shims.js'

AppRegistry.registerComponent('OriginCatcher', () => App)
