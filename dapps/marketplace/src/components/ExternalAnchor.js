import React from 'react'

import withIsMobile from 'hoc/withIsMobile'

// Consume props to avoid passing them down to anchor
/* eslint-disable-next-line no-unused-vars */
const ExternalAnchor = ({ isMobileApp, isMobile, children, ...rest }) => {
  if (isMobileApp) {
    return <>{children}</>
  } else {
    return <a {...rest}>{children}</a>
  }
}

export default withIsMobile(ExternalAnchor)
