import { createStore, applyMiddleware, compose } from 'redux'
import createReducer from './reducers'

const composeEnhancers =
  typeof window === 'object' &&
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose)

export function configureStore() {
  const middlewares = []
  const store = createStore(
    createReducer(),
    {},
    composeEnhancers(applyMiddleware(...middlewares))
  )
  return store
}

export default configureStore
