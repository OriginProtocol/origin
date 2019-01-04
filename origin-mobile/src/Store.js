import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'

import activation from 'reducers/Activation'
import devices from 'reducers/Devices'
import users from 'reducers/Users'
import wallet from 'reducers/Wallet'
import wallet_events from 'reducers/WalletEvents'

let middlewares = [thunkMiddleware]

const store = createStore(
  combineReducers({
    activation,
    devices,
    users,
    wallet,
    wallet_events,
  }),
  applyMiddleware(...middlewares)
)

export default store
