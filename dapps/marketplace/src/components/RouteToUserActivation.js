import React from 'react'

import MobileUserActivation from './MobileUserActivation'
import Redirect from './Redirect'

import useIsMobile from 'utils/useMobile'

const RouteToUserActivation = ({ onClose }) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileUserActivation onClose={onClose} />
  }

  return <Redirect to="/onboard" />
}

export default RouteToUserActivation
