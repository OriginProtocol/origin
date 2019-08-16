import { combineReducers, compose, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import account from '@/reducers/account'
import event from '@/reducers/event'
import grant from '@/reducers/grant'
import user from '@/reducers/user'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default createStore(
  combineReducers({
    account,
    event,
    grant,
    user
  }),
  composeEnhancers(applyMiddleware(thunk))
)
