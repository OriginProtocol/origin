import React from 'react'
import { NavLink } from 'react-router-dom'

const ScrollToTopNavLink = props => {
  let { to } = props
  if (typeof to === 'string') {
    to = { pathname: to, state: { scrollToTop: true } }
  }
  return <NavLink {...props} to={to} />
}

export default ScrollToTopNavLink
