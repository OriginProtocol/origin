import { Route, Switch } from 'react-router-dom'
import { baseConfig } from 'origin-dapp/src/config'
import React from 'react'

import Create from 'pages/Create'
import Customize from 'pages/Customize'
import Configure from 'pages/Configure'
import Steps from 'components/Steps'

class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      config: baseConfig
    }
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
              <Route
                path="/"
                exact
                render={() => (
                  <Create
                    config={this.state.config}
                    onChange={config => this.setState({ config })}
                  />
                )}
              />
              <Route
                path="/customize"
                render={() => (
                  <Customize
                    config={this.state.config}
                    onChange={config => {
                      console.log(config)
                      this.setState({ config })
                    }}
                  />
                )}
              />
              <Route
                path="/"
                render={() => (
                  <Configure
                    config={this.state.config}
                    onChange={config => this.setState({ config })}
                  />
                )}
              />
            </Switch>
          </div>
        </div>
      </>
    )
  }
}

export default App
