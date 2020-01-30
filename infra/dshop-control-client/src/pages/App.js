import React, { useState, useEffect } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import store from '@/store'
import { ToastProvider } from 'react-toast-notifications'

import Edit from './Edit'
import Manage from './Manage'
import Landing from './Landing'
import ProcessShop from './ProcessShop'
import SignIn from './SignIn'

const App = ({ location }) => {
  const [loading, setLoading] = useState(true)

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
    let state = localStorage.getItem('state')
    if (state) {
      try {
        state = JSON.parse(state)
      } catch (error) {
        console.warning('Could not parse localStorage state')
      }
      store.update(() => state)
    }
    setLoading(false)
  }, [])

  // Subscribe to pullstate changes and store in local storage
  store.subscribe(
    s => s,
    (watched, allState) => {
      // console.debug('Setting state in localStorage')
      localStorage.setItem('state', JSON.stringify(allState))
    }
  )

  return (
    <>
      {!loading ? (
        <ToastProvider>
          <Switch>
            <Route path="/edit" component={Edit}></Route>
            <Route path="/manage" component={Manage}></Route>
            <Route
              path="/process/:url/:datadir?"
              component={ProcessShop}
            ></Route>
            <Route path="/signin" component={SignIn}></Route>
            <Route component={Landing}></Route>
          </Switch>
        </ToastProvider>
      ) : (
        'Loading...'
      )}
    </>
  )
}

export default withRouter(App)

require('react-styl')(`
html
  height: 100%
body
  font-size: 1.125rem
  line-height: 1.5
  background-color: white
  font-family: 'Lato'
  height: 100%
  color: #333
a
  color: #007cff
  &:hover,&:focus
    color: #007cff
    opacity: 0.7
    text-decoration: none
#app
  height: 100%
`)
