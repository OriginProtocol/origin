import { Route, Switch } from 'react-router-dom'
import { baseConfig } from 'origin-dapp/src/config'
import React from 'react'
import superagent from 'superagent'

import { AppToaster } from '../toaster'
import Create from 'pages/Create'
import Customize from 'pages/Customize'
import Configure from 'pages/Configure'
import MetaMaskPrompt from 'pages/MetaMaskPrompt'
import Resolver from 'pages/Resolver'
import Steps from 'components/Steps'
import Success from 'pages/Success'
import Store from 'utils/store'
const store = Store('sessionStorage')

class App extends React.Component {
  constructor (props, context) {
    super(props)

    this.web3Context = context.web3

    this.state = {
      config: store.get('creator-config', {
        ...baseConfig
      })
    }

    this.handlePublish = this.handlePublish.bind(this)
    this.handleServerErrors = this.handleServerErrors.bind(this)
    this.setConfig = this.setConfig.bind(this)
    this.signConfig = this.signConfig.bind(this)
  }

  setConfig(config) {
    store.set('creator-config', config)
    this.setState({ config })
  }

  signConfig () {
    if (this.state.config.subdomain) {
      // Generate a valid signature if a subdomain is in use
      const dataToSign = JSON.stringify(this.state.config)
      return this.web3Sign(dataToSign, web3.eth.accounts[0])
    }
  }

  async handlePublish (signature) {
    return superagent.post(`${process.env.DAPP_CREATOR_API_URL}/config`)
      .send({
        config: this.state.config,
        signature: signature,
        address: web3.eth.accounts[0]
      })
      .catch(this.handleServerErrors)
  }

  handleServerErrors (error) {
    console.log('There was an error publishing the configuration: ', error)
  }

  async web3Sign(data, account) {
    // Promise wrapper for web3 signing
    return new Promise((resolve, reject) => {
      web3.personal.sign(data, account, (err, sig) => {
        if (err) {
          reject(err)
        }
        resolve(sig)
      })
    })
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
                    onChange={config => this.setConfig(config)}
                  />
                )}
              />
              <Route
                path="/customize"
                render={() => (
                  <Customize
                    config={this.state.config}
                    onChange={config => this.setConfig(config)}
                  />
                )}
              />
              <Route
                path="/configure"
                render={() => (
                  <Configure
                    config={this.state.config}
                    onChange={config => this.setConfig(config)}
                  />
                )}
              />
              <Route
                path="/metamask"
                render={() => (
                  <MetaMaskPrompt
                    handlePublish={this.handlePublish}
                    signConfig={this.signConfig}
                  />
                )}
              />
              <Route
                path="/resolver"
                render={() => (
                  <Resolver
                    config={this.state.config}
                  />
                )}
              />
              <Route
                path="/success"
                render={() => (
                  <Success config={this.state.config} />
                )}
              />
            </Switch>
          </div>
        </div>

        <div className="copyright">
          &copy;2017 Origin Protocol LLC
        </div>
      </>
    )
  }
}

export default App
