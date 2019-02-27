import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import pick from 'lodash/pick'
import get from 'lodash/get'

import { formInput, formFeedback } from 'utils/formHelpers'
import withConfig from 'hoc/withConfig'
import SetNetwork from 'mutations/SetNetwork'
import ConfigQuery from 'queries/Config'
import ProfileQuery from 'queries/Profile'
import MobileLinkToggle from 'components/MobileLinkToggle'
import LocaleDropdown from 'components/LocaleDropdown'

const configurableFields = [
  'bridge',
  'discovery',
  'ipfsGateway',
  'ipfsRPC',
  'provider',
  'providerWS'
]

class Settings extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ...Object.assign(...configurableFields.map(key => ({ [key]: '' }))),
      ...pick(this.props.config, configurableFields)
    }

    this.saveConfig = this.saveConfig.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.config !== this.props.config) {
      this.setState({
        ...pick(this.props.config, configurableFields)
      })
    }
  }

  saveConfig(setNetwork) {
    window.localStorage.customConfig = JSON.stringify(
      pick(this.state, configurableFields)
    )
    setNetwork({
      variables: { network: window.localStorage.ognNetwork || 'mainnet' }
    })
  }

  render() {
    const input = formInput(this.state, state => this.setState(state))
    const { locale, onLocale } = this.props

    return (
      <Mutation
        mutation={SetNetwork}
        refetchQueries={() => {
          return [
            {
              query: ConfigQuery
            }
          ]
        }}
      >
        {setNetwork => (
          <div className="container settings">
            <h1>Settings</h1>
            <div className="row">
              <div className="col-lg-6 col-md-12">
                <div className="settings-box">
                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <div className="form-text form-text-muted">
                      <small>
                        Please make a selection from the list below.
                      </small>
                    </div>
                    <LocaleDropdown
                      locale={locale}
                      onLocale={onLocale}
                      className="btn btn-secondary"
                      dropdown={true}
                    />
                  </div>

                  {/*
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
                */}

                  <Query query={ProfileQuery}>
                    {({ data }) => {
                      const walletType = get(data.web3, 'walletType')
                      const mobileWalletConnected =
                        walletType && walletType.startsWith('mobile-')
                      return (
                        <div className="form-group">
                          <label htmlFor="language">Mobile Wallet</label>
                          <div className="form-text form-text-muted">
                            {mobileWalletConnected && (
                              <small>
                                Disconnect from your mobile wallet by clicking
                                the button below.
                              </small>
                            )}
                          </div>
                          <MobileLinkToggle
                            isConnected={mobileWalletConnected}
                          />
                        </div>
                      )
                    }}
                  </Query>
                </div>
              </div>

              <div className="col-lg-6 col-md-12">
                <div className="settings-box">
                  <div className="form-group">
                    <label htmlFor="indexing">Discovery Server</label>
                    <div className="form-text form-text-muted">
                      <small>
                        Please enter the URL below. Leave blank to directly
                        query the blockchain. Search functionality will disabled
                        if no discovery server is used.
                      </small>
                    </div>
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      name="discovery"
                      {...input('discovery')}
                      onBlur={() => this.saveConfig(setNetwork)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="indexing">IPFS Gateway</label>
                    <div className="form-text form-text-muted">
                      <small>Please enter the URL below.</small>
                    </div>
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      name="ipfsGateway"
                      {...input('ipfsGateway')}
                      onBlur={() => this.saveConfig(setNetwork)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="indexing">Web3 Provider</label>
                    <div className="form-text form-text-muted">
                      <small>Please enter the URL below.</small>
                    </div>
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      name="web3Provider"
                      {...input('provider')}
                      onBlur={() => this.saveConfig(setNetwork)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="indexing">Bridge Server</label>
                    <div className="form-text form-text-muted">
                      <small>Please enter the URL below.</small>
                    </div>
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      name="bridgeServer"
                      {...input('bridge')}
                      onBlur={() => this.saveConfig(setNetwork)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Mutation>
    )
  }
}

export default withConfig(Settings)

require('react-styl')(`
  .settings
    padding-top: 3rem

  .settings-box
    margin-bottom: 1rem
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
