import React from 'react'

import PrivateRoute from './components/PrivateRoute'
import PublicRoute from './components/PublicRoute'

// Public routes
import Login from './components/pages/Login'
import HandleLogin from './components/pages/HandleLogin'
import Register from './components/pages/Register'
// Private routes
import Dashboard from './components/pages/Dashboard'
import News from './components/pages/News'
import History from './components/pages/History'
import Security from './components/pages/Security'

const App = () => (
  <>
    <PublicRoute exact path="/" component={Login} />
    <PublicRoute path="/login_handler/:code" component={HandleLogin} />
    <PublicRoute path="/register" component={Register} />
    <PrivateRoute path="/dashboard" component={Dashboard} />
    <PrivateRoute path="/news" component={News} />
    <PrivateRoute path="/history" component={History} />
    <PrivateRoute path="/security" component={Security} />
  </>
)

export default App

require('react-styl')(`
  .body
    padding: 70px
  .not-logged-in
    background-color: #007cff
    height: 100%;
    .logo-wrapper
      text-align: center
    .logo
      margin: 80px auto
      width: 160px
  .logged-in
    .container-fluid
      height: 100%
      > .row
        height: 100%
        .sidebar
          width: 260px
`)
