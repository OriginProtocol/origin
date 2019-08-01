import React from 'react'
import { Switch } from 'react-router-dom'

import PrivateRoute from './components/PrivateRoute'
import PublicRoute from './components/PublicRoute'

// Public routes
import Login from './components/pages/Login'
import CheckEmail from './components/pages/CheckEmail'
import HandleLogin from './components/pages/HandleLogin'
import Register from './components/pages/Register'
import Otp from './components/pages/Otp'
import OtpSetup from './components/pages/OtpSetup'
// Private routes
import Dashboard from './components/pages/Dashboard'
import News from './components/pages/News'
import History from './components/pages/History'
import Security from './components/pages/Security'

const App = () => (
  <Switch>
    <PublicRoute exact path="/" component={Login} />
    <PublicRoute path="/check_email" component={CheckEmail} />
    <PublicRoute path="/login_handler/:token" component={HandleLogin} />
    <PublicRoute path="/register" component={Register} />
    <PublicRoute exact path="/otp" component={Otp} />
    <PublicRoute path="/otp/setup" component={OtpSetup} />
    <PrivateRoute path="/dashboard" component={Dashboard} />
    <PrivateRoute path="/news" component={News} />
    <PrivateRoute path="/history" component={History} />
    <PrivateRoute path="/security" component={Security} />
  </Switch>
)

export default App
