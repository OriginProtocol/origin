import React, { useEffect } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import Main from './Main'
import Checkout from './checkout/Loader'
import Order from './OrderLoader'
import Admin from './admin/Admin'

import useConfig from 'utils/useConfig'

const App = ({ location }) => {
  const { loading, config } = useConfig()

  // Redirect to HTTPS if URL is not local
  useEffect(() => {
    const href = window.location.href
    if (
      href.match(/^http:/) &&
      !href.match(/^http:\/\/(localhost|([0-9]+\.))/)
    ) {
      window.location.href = window.location.href.replace('http:', 'https:')
    }
  }, [])

  useEffect(() => {
    if (location.state && location.state.scrollToTop) {
      window.scrollTo(0, 0)
    }
  }, [location.pathname])

  // Add custom CSS
  useEffect(() => {
    if (config && config.css) {
      const css = document.createElement('style')
      css.appendChild(document.createTextNode(config.css))
      document.head.appendChild(css)
    }
  }, [config])

  if (loading) {
    return null
  }

  return (
    <Switch>
      <Route path="/admin" component={Admin}></Route>
      <Route path="/order/:tx" component={Order}></Route>
      <Route path="/checkout" component={Checkout}></Route>
      <Route component={Main}></Route>
    </Switch>
  )
}

export default withRouter(App)

require('react-styl')(`
  body
    color: #333
    font-family: "Lato"
  a
    color: #333
    &:hover,&:focus
      color: #333
      opacity: 0.7
      text-decoration: none
`)
