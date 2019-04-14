'use strict'

import '@babel/polyfill'

import { AppRegistry } from 'react-native'
import { Sentry } from 'react-native-sentry'
Sentry.config(
  'https://0711315529954f25bb2ee58315fe477b@sentry.io/1399965'
).install()

import './global'
import App from './src/App'

AppRegistry.registerComponent('OriginCatcher', () => App)
