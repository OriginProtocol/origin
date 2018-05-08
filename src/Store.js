import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import listings from './reducers/Listings'
import alert from './reducers/Alert'

let middlewares = [thunkMiddleware]

if (process.env.NODE_ENV !== 'production') {
  const { logger } = require(`redux-logger`)
  middlewares.push(logger)
}

const store = createStore(
  combineReducers({
    listings,
    alert
  }),
  applyMiddleware(...middlewares)
)

export default store
