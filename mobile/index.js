'use strict'

import '@babel/polyfill'

import { AppRegistry } from 'react-native'

import './global'
import App from './src/App'

AppRegistry.registerComponent('OriginCatcher', () => App)
