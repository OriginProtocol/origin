import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import listings from './reducers/Listings'

let middlewares = [thunkMiddleware]

if (process.env.NODE_ENV !== 'production') {
  const { logger } = require(`redux-logger`)
  middlewares.push(logger)
}

const store = createStore(
  combineReducers({
    listings,
  }),
  applyMiddleware(...middlewares)
)

window.store = store

export default store
