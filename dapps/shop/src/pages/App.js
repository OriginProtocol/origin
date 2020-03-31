import React, { useEffect, useState } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import get from 'lodash/get'

import Main from './Main'
import Checkout from './checkout/Loader'
import Order from './OrderLoader'
import Password from './Password'
import Admin from './admin/Admin'

import dataUrl from 'utils/dataUrl'
import { useStateValue } from 'data/state'

const { BACKEND_AUTH_TOKEN } = process.env

const App = ({ location, config }) => {
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [{ passwordAuthed }, dispatch] = useStateValue()
  const isAdmin = location.pathname.indexOf('/admin') === 0
  const isOrder = location.pathname.indexOf('/order') === 0

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

  useEffect(() => {
    if (!get(config, 'passwordProtected') || passwordAuthed) {
      return
    }
    setPasswordLoading(true)
    fetch(`${config.backend}/password`, {
      headers: {
        'content-type': 'application/json',
        authorization: `bearer ${BACKEND_AUTH_TOKEN}`
      },
      credentials: 'include'
    }).then(async response => {
      setPasswordLoading(false)
      if (response.status === 200) {
        const data = await response.json()
        dispatch({ type: 'setPasswordAuthed', authed: data.success })
      }
    })
  }, [config, location.pathname])

  // Add custom CSS
  useEffect(() => {
    if (config && config.css) {
      const css = document.createElement('style')
      css.appendChild(document.createTextNode(config.css))
      document.head.appendChild(css)
    }
    if (config && config.fullTitle) {
      document.title = config.fullTitle
    }
    if (config && config.favicon) {
      const favicon = document.querySelector('link[rel="icon"]')
      favicon.href = `${dataUrl()}${config.favicon}`
    }
  }, [config])

  if (passwordLoading) {
    return null
  }

  if (config.passwordProtected && !passwordAuthed && !isAdmin && !isOrder) {
    return <Password />
  }

  return (
    <Switch>
      <Route path="/admin" component={Admin}></Route>
      <Route path="/order/:tx" component={Order}></Route>
      <Route path="/checkout" component={Checkout}></Route>
      <Route path="/password" component={Password}></Route>
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
