'use strict'

import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

import activation from 'reducers/Activation'
import exchangeRates from 'reducers/ExchangeRates'
import notifications from 'reducers/Notifications'
import wallet from 'reducers/Wallet'
import { persistStore, persistReducer } from 'redux-persist'
import createEncryptor from 'redux-persist-transform-encrypt'
import storage from 'redux-persist/lib/storage'

const encryptor = createEncryptor({
  secretKey: 'WALLET_PASSWORD'
})

const persistConfig = {
  key: 'OriginWallet.encrypted',
  storage: storage,
  whitelist: ['activation', 'notifications', 'wallet'],
  transforms: [encryptor]
}

const middlewares = [thunkMiddleware]
// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  persistReducer(
    persistConfig,
    combineReducers({
      activation,
      exchangeRates,
      notifications,
      wallet
    })
  ),
  composeEnhancers(applyMiddleware(...middlewares))
)

const persistor = persistStore(store)

export default store

export { store, persistor }
