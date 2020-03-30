import request from 'superagent'

import store from '@/store'
import { setSessionExpired } from '@/actions/session'

const agent = request
  .agent()
  .withCredentials(true)
  .on('error', error => {
    if (error.status === 401) {
      store.dispatch(setSessionExpired(true))
    }
  })

export default agent
