import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import app from './reducers/App'
import devices from './reducers/Devices'
import profile from './reducers/Profile'
import wallet from './reducers/Wallet'
import wallet_events from './reducers/WalletEvents'

let middlewares = [thunkMiddleware]

const store = createStore(
  combineReducers({
    app,
    devices,
    profile,
    wallet,
    wallet_events,
  }),
  applyMiddleware(...middlewares)
)

export default store
