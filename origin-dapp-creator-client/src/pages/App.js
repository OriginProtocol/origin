import { Route, Switch } from 'react-router-dom'
import { Web3Provider } from 'react-web3'
import { baseConfig } from 'origin-dapp/src/config'
import React from 'react'
import superagent from 'superagent'

import Create from 'pages/Create'
import Customize from 'pages/Customize'
import Configure from 'pages/Configure'
import MetaMaskRequirement from 'pages/MetaMaskRequirement'
import MetaMaskPrompt from 'pages/MetaMaskPrompt'
import Resolver from 'pages/Resolver'
import StepsContainer from 'components/StepsContainer'
import Success from 'pages/Success'
import CustomDomainInstructions from 'pages/CustomDomainInstructions'
import Store from 'utils/store'
const store = Store('sessionStorage')

class App extends React.Component {
  constructor(props, context) {
    super(props)

    this.web3Context = context.web3

    this.state = {
      config: store.get('creator-config', {
        ...baseConfig,
        marketplacePublisher: ''
      }),
      publishedIpfsHash: null
    }

    this.handlePublish = this.handlePublish.bind(this)
    this.onWeb3AccountChange = this.onWeb3AccountChange.bind(this)
    this.setConfig = this.setConfig.bind(this)
    this.signConfig = this.signConfig.bind(this)
  }

  setConfig(config) {
    store.set('creator-config', config)
    this.setState({ config })
  }

  signConfig() {
    if (this.state.config.subdomain) {
      // Generate a valid signature if a subdomain is in use
      const dataToSign = JSON.stringify(this.state.config)
      return this.web3Sign(dataToSign, web3.eth.accounts[0])
    }
  }

  onWeb3AccountChange(nextAddress) {
    // Update listings filters if exists
    if (
      this.state.config.filters.listings &&
      this.state.config.filters.listings.marketplacePublisher
    ) {
      this.setState({
        config: {
          ...this.state.config,
          filters: {
            ...this.state.config.filters,
            listings: {
              ...this.state.config.filters.listings,
              marketplacePublisher: nextAddress
            }
          }
        }
      })
    }
  }

  async handlePublish(signature) {
    // Set the marketplacePublisher field to the current account
    this.setState({
      config: {
        ...this.state.config,
        marketplacePublisher: web3.eth.accounts[0]
      }
    })
    // Post to API
    return superagent
      .post(`${process.env.DAPP_CREATOR_API_URL}/config`)
      .send({
        config: this.state.config,
        signature: signature,
        address: web3.eth.accounts[0]
      })
      .then(response => {
        this.setState({ publishedIpfsHash: response.text })
      })
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
      <Web3Provider
        onChangeAccount={this.onWeb3AccountChange}
        accountUnavailableScreen={MetaMaskRequirement}
        web3UnavailableScreen={MetaMaskRequirement}
      >
        <div className="logo">
          <img src="images/origin-logo.svg" className="logo" />
        </div>

        <div className="main">
          <StepsContainer />

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
                render={() => <Resolver config={this.state.config} />}
              />
              <Route
                path="/success"
                render={() => <Success config={this.state.config} />}
              />
              <Route
                path="/customdomain"
                render={() => (
                  <CustomDomainInstructions
                    publishedIpfsHash={this.state.publishedIpfsHash}
                  />
                )}
              />
            </Switch>
          </div>
        </div>

        <div className="copyright">
          &copy;{new Date().getFullYear()} Origin Protocol Inc.
        </div>
      </Web3Provider>
    )
  }
}

export default App
