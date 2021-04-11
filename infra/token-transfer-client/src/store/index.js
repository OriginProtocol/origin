import { combineReducers, compose, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import account from '@/reducers/account'
import config from '@/reducers/config'
import event from '@/reducers/event'
import grant from '@/reducers/grant'
import lockup from '@/reducers/lockup'
import news from '@/reducers/news'
import otc from '@/reducers/otc'
import otp from '@/reducers/otp'
import session from '@/reducers/session'
import transfer from '@/reducers/transfer'
import user from '@/reducers/user'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default createStore(
  combineReducers({
    account,
    config,
    event,
    grant,
    lockup,
    news,
    otc,
    otp,
    session,
    transfer,
    user
  }),
  composeEnhancers(applyMiddleware(thunk))
)
