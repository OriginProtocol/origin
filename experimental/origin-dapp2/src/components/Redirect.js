import React from 'react'
import { Redirect } from 'react-router-dom'

const ScrollToTopRedirect = props => {
  let { to } = props
  if (typeof to === 'string') {
    to = { pathname: to, state: { scrollToTop: true } }
  }
  return <Redirect push {...props} to={to} />
}

export default ScrollToTopRedirect
