import { Route, Switch } from 'react-router-dom'
import { baseConfig } from 'origin-dapp/src/config'
import React from 'react'
import superagent from 'superagent'

import { AppToaster } from '../toaster'
import Create from 'pages/Create'
import Customize from 'pages/Customize'
import Configure from 'pages/Configure'
import Steps from 'components/Steps'

class App extends React.Component {
  constructor (props, context) {
    super(props)

    this.web3Context = context.web3

    this.state = {
      config: baseConfig
    }
  }

  async handlePublish (event) {
    event.preventDefault()

    this.setState({ publishing: true })

    let signature = null
    if (this.state.config.subdomain) {
      // Generate a valid signature if a subdomain is in use
      const dataToSign = JSON.stringify(this.state.config)
      signature = await this.web3Sign(dataToSign, web3.eth.accounts[0])
    }

    return superagent.post(`${process.env.DAPP_CREATOR_API_URL}/config`)
      .send({
        config: this.state.config,
        signature: signature,
        address: web3.eth.accounts[0]
      })
      .then((res) => {
        this.setState({
          ipfsHash: res.text,
          successDialogIsOpen: true
        })
      })
      .catch(this.handleServerErrors)
      .finally(() => this.setState({ publishing: false }))
  }

  handleServerErrors (error) {
    if (error.status == 400) {
      this.setState({ errors: error.response.body })
      AppToaster.show({
        intent: Intent.WARNING,
        message: 'There was an error with your submission. Please check the' +
          ' form for details.'
      })
    } else {
      AppToaster.show({
        intent: Intent.DANGER,
        message: 'There was an error publishing your DApp configuration'
      })
    }
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
                path="/configure"
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
