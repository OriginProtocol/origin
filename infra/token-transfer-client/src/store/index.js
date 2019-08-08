import { combineReducers, compose, createStore, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import thunk from 'redux-thunk'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import account from '@/reducers/account'
import grant from '@/reducers/grant'
import session from '@/reducers/session'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['session']
}
const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    account,
    grant,
    session
  })
)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk))
)
const persistor = persistStore(store)

export { store, persistor }
