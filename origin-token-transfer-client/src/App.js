import React from 'react'
import './App.css'

// Blueprint CSS imports
import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'

import { Provider } from 'react-redux'
import store from './store'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'

import Events from './components/Events'
import Grants from './components/Grants'
import Login from './components/Login'

function redirectToGrants() {
  return <Redirect to="/grants" />
}

function App() {
  // TODO: use SSL
  return (
    <Provider store={store}>
      <Router>
        <div>
          <Route path="/login" component={Login} />
          <Route path="/grants" component={Grants} />
          <Route path="/events" component={Events} />
          <Route path="/" exact={true} component={redirectToGrants} />
        </div>
      </Router>
    </Provider>
  )
}

export default App
