import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'

import activation from 'reducers/Activation'
import devices from 'reducers/Devices'
import profile from 'reducers/Profile'
import wallet from 'reducers/Wallet'
import wallet_events from 'reducers/WalletEvents'

let middlewares = [thunkMiddleware]

const store = createStore(
  combineReducers({
    activation,
    devices,
    profile,
    wallet,
    wallet_events,
  }),
  applyMiddleware(...middlewares)
)

export default store
