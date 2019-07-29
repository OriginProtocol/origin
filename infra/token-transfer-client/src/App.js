import React from 'react'
import './css/app.css'

import { Provider } from 'react-redux'
import store from './store'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import AccountActions from './components/AccountActions'
import Navigation from './components/Navigation'
import Dashboard from './components/pages/Dashboard'
import News from './components/pages/News'
import History from './components/pages/History'
import Security from './components/pages/Security'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <>
          <div className="container-fluid">
            <div className="row">
              <div className="sidebar">
                <Navigation />
              </div>
              <div className="col body">
                <AccountActions />
                <Route path="/" exact={true} component={Dashboard} />
                <Route path="/news" component={News} />
                <Route path="/history" component={History} />
                <Route path="/security" component={Security} />
              </div>
            </div>
          </div>
        </>
      </Router>
    </Provider>
  )
}

export default App

require('react-styl')(`
  #root
    background-color: #f7fbfd
  .container-fluid
    height: 100%
  .container-fluid > .row
    height: 100%
  .sidebar
    width: 260px
  .body
    padding: 70px
`)
