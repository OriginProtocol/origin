import { compose, createStore, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import thunk from 'redux-thunk'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import rootReducer from '../reducers/index'

const persistConfig = {
  key: 'root',
  storage
}
const persistedReducer = persistReducer(persistConfig, rootReducer)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk))
)
const persistor = persistStore(store)

export { store, persistor }
