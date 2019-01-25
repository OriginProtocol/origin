import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import notifications from 'reducers/Notifications'
import exchangeRates from 'reducers/ExchangeRates'
import transactions from 'reducers/Transactions'
import activation from 'reducers/Activation'
import listings from 'reducers/Listings'
import messages from 'reducers/Messages'
import profile from 'reducers/Profile'
import wallet from 'reducers/Wallet'
import search from 'reducers/Search'
import config from 'reducers/Config'
import alert from 'reducers/Alert'
import users from 'reducers/Users'
import app from 'reducers/App'

const middlewares = [thunkMiddleware]

if (process.env.REDUX_LOGGER) {
  const { logger } = require('redux-logger')
  middlewares.push(logger)
}

const store = createStore(
  combineReducers({
    notifications,
    exchangeRates,
    transactions,
    activation,
    listings,
    messages,
    profile,
    wallet,
    search,
    config,
    alert,
    users,
    app
  }),
  applyMiddleware(...middlewares)
)

export default store
