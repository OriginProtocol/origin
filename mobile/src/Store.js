'use strict'

import { applyMiddleware, createStore, combineReducers, compose } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage'
import createEncryptor from 'redux-persist-transform-encrypt'
import thunk from 'redux-thunk'

import activation from 'reducers/Activation'
import exchangeRates from 'reducers/ExchangeRates'
import marketplace from 'reducers/Marketplace'
import notifications from 'reducers/Notifications'
import samsungBKS from 'reducers/SamsungBKS'
import settings from 'reducers/Settings'
import wallet from 'reducers/Wallet'

const encryptor = createEncryptor({
  secretKey: 'WALLET_PASSWORD'
})

const persistConfig = {
  timeout: null,
  key: 'EncryptedOriginWallet',
  storage: AsyncStorage,
  whitelist: [
    'activation',
    'exchangeRates',
    'notifications',
    'samsungBKS',
    'settings',
    'wallet'
  ],
  blacklist: ['onboarding'],
  transforms: [encryptor]
}

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  persistReducer(
    persistConfig,
    combineReducers({
      activation,
      exchangeRates,
      marketplace,
      notifications,
      samsungBKS,
      settings,
      wallet
    })
  ),
  composeEnhancers(applyMiddleware(thunk))
)

const persistor = persistStore(store)

export default store

export { store, persistor }
