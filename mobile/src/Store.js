import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'

import activation from 'reducers/Activation'
import exchangeRates from 'reducers/ExchangeRates'
import notifications from 'reducers/Notifications'
import users from 'reducers/Users'
import wallet from 'reducers/Wallet'
import walletEvents from 'reducers/WalletEvents'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['notifications', 'walletEvents']
}

const middlewares = [thunkMiddleware]

const store = createStore(
  persistReducer(
    persistConfig,
    combineReducers({
      activation,
      exchangeRates,
      notifications,
      users,
      wallet,
      walletEvents
    })
  ),
  applyMiddleware(...middlewares)
)

persistStore(store)

export default store
