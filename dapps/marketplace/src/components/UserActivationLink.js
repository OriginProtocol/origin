import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import Link from './Link'
import useIsMobile from 'utils/useMobile'
import MobileUserActivation from './MobileUserActivation'
import store from 'utils/store'
const sessionStore = store('sessionStorage')

const UserActivationLink =  props => {
  const isMobile = useIsMobile()
  const [modal, setModal] = useState(false)

  if (modal) {
    return <MobileUserActivation onClose={props.onClose} />
  }

  let content = <fbt desc="navigation.getStarted.getStarted">Get Started</fbt>

  if (props.children) {
    content = props.children
  }

  if (isMobile) {
    return (
      <button className={props.className} onClick={() => setModal(true)}>
        { content }
      </button>
    )
  }

  return (
    <Link
      to="/onboard"
      className={props.className}
      onClick={() => {
        if (props.onClick) {
          props.onClick()
        }

        if (props.location) {
          const { pathname, search } = props.location
          sessionStore.set('getStartedRedirect', { pathname, search })
        }
      }}
    >
      { content }
    </Link>
  )
}

export default UserActivationLink