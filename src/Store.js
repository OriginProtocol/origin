import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'

import listings from './reducers/Listings'
import profile from './reducers/Profile'
import wallet from './reducers/Wallet'
import alert from './reducers/Alert'
import users from './reducers/Users'

let middlewares = [thunkMiddleware]

if (process.env.NODE_ENV !== 'production') {
  const { logger } = require(`redux-logger`)
  middlewares.push(logger)
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({
    listings,
    profile,
    wallet,
    alert,
    users,
  }),
  composeEnhancers(
  	applyMiddleware(...middlewares)
  ),
)

export default store
