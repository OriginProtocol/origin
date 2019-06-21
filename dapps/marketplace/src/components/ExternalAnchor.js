import React, { Component } from 'react'

import withIsMobile from 'hoc/withIsMobile'

const ExternalAnchor = ({ isMobileApp, isMobile, children, ...rest }) => {
  if (isMobileApp) {
    return <>{children}</>
  } else {
    return <a {...rest}>{children}</a>
  }
}

export default withIsMobile(ExternalAnchor)
