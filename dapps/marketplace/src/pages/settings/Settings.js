import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import pick from 'lodash/pick'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import { formInput } from 'utils/formHelpers'
import withConfig from 'hoc/withConfig'
import SetNetwork from 'mutations/SetNetwork'
import ConfigQuery from 'queries/Config'
import ProfileQuery from 'queries/Profile'
import LocaleDropdown from 'components/LocaleDropdown'
import DocumentTitle from 'components/DocumentTitle'
import UnlinkMobileWallet from 'mutations/UnlinkMobileWallet'

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

  requestNotificationPermission() {
    Notification.requestPermission().then(permission => {
      this.setState({ permission: permission })
      if (permission === 'granted') {
        this.showNotification()
      }
    })
  }

  showNotification() {
    new Notification(
      fbt('Desktop notifications enabled ✅', 'settings.notificationsEnabled'),
      {
        icon: 'images/app-icon.png'
      }
    )
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
            <DocumentTitle
              pageTitle={<fbt desc="settings.title">Settings</fbt>}
            />
            <h1>
              <fbt desc="settings.heading">Settings</fbt>
            </h1>
            <div className="row">
              <div className="col-lg-6 col-md-12">
                <div className="settings-box">
                  <div className="form-group">
                    <label htmlFor="language">
                      <fbt desc="settings.languageLabel">Language</fbt>
                    </label>
                    <div className="form-text form-text-muted">
                      <small>
                        <fbt desc="settings.language">
                          Please make a selection from the list below.
                        </fbt>
                      </small>
                    </div>
                    <LocaleDropdown
                      locale={locale}
                      onLocale={onLocale}
                      className="btn btn-secondary"
                      dropdown={true}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notifications">
                      <fbt desc="settings.notificationsLabel">
                        Notifications
                      </fbt>
                    </label>
                    {Notification.permission !== 'granted' ? (
                      <>
                        <div className="form-text form-text-muted">
                          <small>
                            <fbt desc="settings.notificationsHint">
                              Enable browser notifications below.
                            </fbt>
                          </small>
                        </div>
                        <button
                          className="btn btn-success"
                          onClick={() => this.requestNotificationPermission()}
                        >
                          <fbt desc="settings.notificationsButton">Enable</fbt>
                        </button>
                      </>
                    ) : (
                      <div>
                        <fbt desc="settings.notificationsSuccess">
                          Browser notifications are enabled.
                        </fbt>
                      </div>
                    )}
                  </div>

                  {/*
                  <div className="form-group">
                    <label htmlFor="Messaging"><fbt desc="settings.messagingLabel">Messaging</fbt></label>
                    <div className="form-text form-text-muted">
                      <small><fbt desc="settings.messagingHint">Enable/disable messaging by clicking the button below.</fbt></small>
                    </div>
                    <button className="btn btn-outline-danger">
                      <fbt desc="settings.messagingButton">Disable</fbt>
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
                          <label htmlFor="language">
                            <fbt desc="settings.mobileLabel">Mobile Wallet</fbt>
                          </label>
                          {mobileWalletConnected ? (
                            <>
                              <div className="form-text form-text-muted">
                                <small>
                                  <fbt desc="settings.mobileHint">
                                    Disconnect from your mobile wallet by
                                    clicking the button below.
                                  </fbt>
                                </small>
                              </div>
                              <Mutation mutation={UnlinkMobileWallet}>
                                <button className="btn btn-outline-danger">
                                  <fbt desc="settings.mobileButton">
                                    Disconnect
                                  </fbt>
                                </button>
                              </Mutation>
                            </>
                          ) : (
                            <div>
                              <button
                                className="btn btn-outline-secondary"
                                disabled
                              >
                                <span>
                                  <fbt desc="settings.mobileDisabled">
                                    Not connected
                                  </fbt>
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    }}
                  </Query>
                </div>
              </div>

              <div className="col-lg-6 col-md-12">
                <div className="settings-box">
                  <div className="form-group">
                    <label htmlFor="indexing">
                      <fbt desc="settings.discoveryLabel">Discovery Server</fbt>
                    </label>
                    <div className="form-text form-text-muted">
                      <small>
                        <fbt desc="settings.discoveryHint">
                          Please enter the URL below. Leave blank to directly
                          query the blockchain. Search functionality will
                          disabled if no discovery server is used.
                        </fbt>
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
                    <label htmlFor="indexing">
                      <fbt desc="settings.ipfsLabel">IPFS Gateway</fbt>
                    </label>
                    <div className="form-text form-text-muted">
                      <small>
                        <fbt desc="settings.ipfsHint">
                          Please enter the URL below.
                        </fbt>
                      </small>
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
                    <label htmlFor="indexing">
                      <fbt desc="settings.providerLabel">Web3 Provider</fbt>
                    </label>
                    <div className="form-text form-text-muted">
                      <small>
                        <fbt desc="settings.providerHint">
                          Please enter the URL below.
                        </fbt>
                      </small>
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
                    <label htmlFor="indexing">
                      <fbt desc="settings.bridgeLabel">Bridge Server</fbt>
                    </label>
                    <div className="form-text form-text-muted">
                      <small>
                        <fbt desc="settings.bridgeHint">
                          Please enter the URL below.
                        </fbt>
                      </small>
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
