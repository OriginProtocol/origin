'use strict'

import { createStore, combineReducers, compose } from 'redux'
import { createTransform } from 'redux-persist'

import activation from 'reducers/Activation'
import exchangeRates from 'reducers/ExchangeRates'
import marketplace from 'reducers/Marketplace'
import notifications from 'reducers/Notifications'
import settings from 'reducers/Settings'
import wallet from 'reducers/Wallet'
import { persistStore, persistReducer } from 'redux-persist'
import createEncryptor from 'redux-persist-transform-encrypt'
import storage from 'redux-persist/lib/storage'

const encryptor = createEncryptor({
  secretKey: 'WALLET_PASSWORD'
})

const ValidateAccountTransform = createTransform(
  inboundState => inboundState,
  // Transform state being rehydrated
  outboundState => {
    // Make sure all accounts in the store are valid, i.e. that they have
    // both an address and a private key
    return {
      ...outboundState,
      accounts: outboundState.accounts.filter(account => {
        return account.address && account.privateKey
      })
    }
  },
  {
    // Only apply this to wallet
    whitelist: ['wallet']
  }
)

const persistConfig = {
  key: 'EncryptedOriginWallet',
  storage: storage,
  whitelist: [
    'activation',
    'exchangeRates',
    'notifications',
    'settings',
    'wallet'
  ],
  transforms: [ValidateAccountTransform, encryptor]
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
      settings,
      wallet
    })
  ),
  composeEnhancers()
)

const persistor = persistStore(store)

export default store

export { store, persistor }
