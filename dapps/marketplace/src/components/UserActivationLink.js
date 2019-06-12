import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'
import { useEffect } from 'react'

import Link from './Link'
import Redirect from './Redirect'
import useIsMobile from 'utils/useMobile'
import MobileUserActivation from './MobileUserActivation'
import store from 'utils/store'
const sessionStore = store('sessionStorage')

const storeLocationToStore = props => {
  if (props.location) {
    const { pathname, search } = props.location
    sessionStore.set('getStartedRedirect', { pathname, search })
  }
}

const UserActivationLink = props => {
  const isMobile = useIsMobile()
  const [modal, setModal] = useState(false)
  const [redirectToHome, setRedirectToHome] = useState(false)

  if (redirectToHome) {
    return <Redirect to={sessionStore.get('getStartedRedirect', '/')} />
  }

  const shouldShowMobileModal = modal || (isMobile && props.forceRedirect)

  useEffect(() => {
    if (shouldShowMobileModal) {
      storeLocationToStore(props)
    }
  }, [props.location])

  if (shouldShowMobileModal) {
    return (
      <MobileUserActivation
        onClose={() => {
          setModal(false)
          if (props.forceRedirect) {
            setRedirectToHome(true)
          } else if (props.onClose) {
            props.onClose()
          }
        }}
      />
    )
  }

  if (props.forceRedirect) {
    return <Redirect to="/onboard" />
  }

  let content = <fbt desc="navigation.getStarted.getStarted">Get Started</fbt>

  if (props.children) {
    content = props.children
  }

  if (isMobile) {
    return (
      <button className={props.className} onClick={() => setModal(true)}>
        {content}
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
        storeLocationToStore(props)
      }}
    >
      {content}
    </Link>
  )
}

export default UserActivationLink
