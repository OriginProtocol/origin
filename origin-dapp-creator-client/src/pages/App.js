import React from 'react'
import { Switch, Route, NavLink } from 'react-router-dom'

import Create from 'pages/Create'
import Customize from 'pages/Customize'
import Configure from 'pages/Configure'
import Steps from 'components/Steps'

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
          <Steps  />

          <div className="form">
            <Switch>
              <Route path="/" exact component={Create} />
              <Route path="/customize" exact component={Customize} />
              <Route path="/configure" exact component={Configure} />
            </Switch>
          </div>
        </div>
      </>
    )
  }
}

export default App
