import React from 'react'
import { Link } from 'react-router-dom'

const ScrollToTopLink = props => {
  let { to } = props
  if (typeof to === 'string') {
    to = { pathname: to, state: { scrollToTop: true } }
  }
  return <Link {...props} to={to} />
}

export default ScrollToTopLink
