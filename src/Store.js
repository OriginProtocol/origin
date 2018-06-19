import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import profile from './reducers/Profile'
import wallet from './reducers/Wallet'

let middlewares = [thunkMiddleware]

const store = createStore(
  combineReducers({
    profile,
    wallet,
  }),
  applyMiddleware(...middlewares)
)

export default store
