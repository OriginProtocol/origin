import React from 'react'
import { Redirect } from 'react-router-dom'
import { useStoreState } from 'pullstate'

import axios from 'utils/axiosWithCredentials'
import store from '@/store'

const SignOut = () => {
  const backendConfig = useStoreState(store, s => s.backend)
  const authenticated = useStoreState(store, s => s.hasAuthenticated)

  if (authenticated) {
    console.log('Logging out...')
    try {
      axios.post(`${backendConfig.url}/auth/logout`).then(() => {
        console.log('setting hasAuthenticated to false...')
        store.update(s => {
          s.hasAuthenticated = false
        })
      })
    } catch (error) {
      console.error(error)
    }
  }
  return <Redirect push to="/" />
}

export default SignOut

require('react-styl')(``)
