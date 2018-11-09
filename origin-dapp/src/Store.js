import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import notifications from 'reducers/Notifications'
import exchangeRates from 'reducers/ExchangeRates'
import transactions from 'reducers/Transactions'
import marketplace from 'reducers/Marketplace'
import onboarding from 'reducers/Onboarding'
import listings from 'reducers/Listings'
import messages from 'reducers/Messages'
import profile from 'reducers/Profile'
import wallet from 'reducers/Wallet'
import search from 'reducers/Search'
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
    marketplace,
    onboarding,
    listings,
    messages,
    profile,
    wallet,
    search,
    alert,
    users,
    app
  }),
  applyMiddleware(...middlewares)
)

export default store
