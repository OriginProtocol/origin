import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import withConfig from 'hoc/withConfig'
import UpdateConfig from 'mutations/UpdateConfig'

class Settings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      config: this.state.config
    }
  }

  render() {
    return (
      <div className="container settings">
        <h1>Settings</h1>
        <div className="row">
          <div className="col settings-box">
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <div className="form-text form-text-muted">
                <small>Please make a selection from the list below.</small>
              </div>
              <select className="form-control form-control-lg">
                English
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notifications">Notifications</label>
              <div className="form-text form-text-muted">
                <small>Set your notifications settings below.</small>
              </div>
              <div className="form-check">
                <input className="form-check-input"
                    type="radio"
                    name="notifications"
                    id="notificationsOffRadio"
                    value="true"
                    checked />
                <label className="form-check-label" htmlFor="notifiationsOffRadio">
                  Off
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input"
                    type="radio"
                    name="notifications"
                    id="notificationsOnRadio"
                    value="true" />
                <label className="form-check-label" htmlFor="notificationsOnRadio">
                  All messages
                </label>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="Messaging">Messaging</label>
              <div className="form-text form-text-muted">
                <small>Enable/disable messaging by clicking the button below.</small>
              </div>
              <button className="btn btn-outline-danger">
                Disable
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="language">Mobile Wallet</label>
              <div className="form-text form-text-muted">
                <small>Disconnect from your mobile wallet by clicking the button below.</small>
              </div>
              <button className="btn btn-outline-danger">
                Disconnect
              </button>
            </div>
          </div>
          <div className="col settings-box">
            <div className="form-group">
              <label htmlFor="indexing">Indexing Server</label>
              <div className="form-text form-text-muted">
                <small>Please select if you'd like to use an indexing server.</small>
              </div>
              <div className="form-check">
                <input className="form-check-input"
                    type="radio"
                    name="indexing"
                    id="indexingOnRadio"
                    checked={this.state.config.discovery ? true : false} />
                <label className="form-check-label" htmlFor="notificationsOnRadio">
                  Yes
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input"
                    type="radio"
                    name="indexing"
                    id="indexingOffRadio"
                    checked={this.state.config.discovery ? false : true} />
                <label className="form-check-label" htmlFor="notifiationsOffRadio">
                  No
                </label>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="indexing">IPFS Gateway</label>
              <div className="form-text form-text-muted">
                <small>Please enter the URL below.</small>
              </div>
              <input className="form-control form-control-lg"
                  type="text"
                  name="ipfsGateway"
                  value={this.state.config.ipfsGateway} />
            </div>
            <div className="form-group">
              <label htmlFor="indexing">Web3 Provider</label>
              <div className="form-text form-text-muted">
                <small>Please enter the URL below.</small>
              </div>
              <input className="form-control form-control-lg"
                  type="text"
                  name="web3Providrer"
                  value={this.state.config.provider} />
            </div>
            <div className="form-group">
              <label htmlFor="indexing">Bridge Server</label>
              <div className="form-text form-text-muted">
                <small>Please enter the URL below.</small>
              </div>
              <input className="form-control form-control-lg"
                  type="text"
                  name="bridgeServer"
                  value={this.state.config.bridge} />
            </div>
          </div>
        </div>

        <Mutation mutation={UpdateConfig}>
          {(updateConfig, { client }) => (
            <button
              className="btn btn-lg"
              onClick={async () => {
                updateConfig({ variables: {} })
              }}
            >
              Save
            </button>
          )}
        </Mutation>
      </div>
    )
  }
}

export default withConfig(Settings)

require('react-styl')(`
  .settings
    padding-top: 3rem

  .settings-box
    margin: 1rem
    padding: 2rem
    border: 1px solid var(--light)
    border-radius: var(--default-radius)

  .settings
    .form-text
      margin-top: -0.75rem
      margin-bottom: 0.5rem
      small
        font-size: 70%
    .form-group
      margin-bottom: 1.5rem
`)
