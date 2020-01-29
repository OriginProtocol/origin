import React from 'react'
import { fbt } from 'fbt-runtime'
import { useEffect } from 'react'

import Link from './Link'
import Redirect from './Redirect'
import store from 'utils/store'
const sessionStore = store('sessionStorage')

const storeLocationToStore = props => {
  if (props.location) {
    const { pathname, search } = props.location
    sessionStore.set('getStartedRedirect', { pathname, search })
  }
}

const UserActivationLink = props => {
  useEffect(() => {
    if (props.forceRedirect) {
      storeLocationToStore(props)
    }
  }, [props.location])

  if (props.forceRedirect) {
    return <Redirect to="/onboard" />
  }

  let content = (
    <span>
      <fbt desc="navigation.getStarted.getStarted">Get Started</fbt>
    </span>
  )

  if (props.children) {
    content = props.children
  }

  return (
    <Link
      to={props.listing ? `/listing/${props.listing.id}/onboard` : '/onboard'}
      className={props.className}
      onClick={() => {
        if (props.onClick) {
          props.onClick()
        }
        storeLocationToStore(props)
      }}
    >
      {content}
    </Link>
  )
}

export default UserActivationLink
