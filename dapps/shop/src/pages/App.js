import React, { useEffect } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import Main from './Main'
import Checkout from './checkout/Loader'
import Order from './OrderLoader'
import Admin from './admin/Admin'

import dataUrl from 'utils/dataUrl'

const CSS = process.env.SITE_CSS

const App = ({ location }) => {
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

  useEffect(() => {
    if (CSS) {
      const link = document.createElement('link')
      link.type = 'text/css'
      link.rel = 'stylesheet'
      link.href = `${dataUrl()}${CSS}`
      document.head.appendChild(link)
    }
  }, [])

  return (
    <Switch>
      <Route path="/order/:tx" component={Order}></Route>
      <Route path="/checkout" component={Checkout}></Route>
      <Route path="/admin" component={Admin}></Route>
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
