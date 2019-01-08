import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'

import Create from 'pages/Create'
import Help from 'pages/Help'

class App extends React.Component {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <>
      <div className="logo">
        <img src="images/origin-logo.svg" className="logo" />
      </div>

      <div className="main">
        <div className="form">
          <Switch>
            <Route path="/" exact component={Create} />
            <Route path="/docs" component={Help} />
          </Switch>
        </div>
      </div>
      </>
    )
  }
}

export default App
