import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import profile from './reducers/Profile'
import wallet from './reducers/Wallet'
import wallet_events from './reducers/WalletEvents'
import devices from './reducers/Devices'

let middlewares = [thunkMiddleware]

const store = createStore(
  combineReducers({
    profile,
    wallet,
    wallet_events,
    devices
  }),
  applyMiddleware(...middlewares)
)

export default store
