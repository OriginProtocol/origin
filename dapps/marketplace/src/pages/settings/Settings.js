import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import { formInput } from 'utils/formHelpers'
import withConfig from 'hoc/withConfig'
import SetNetwork from 'mutations/SetNetwork'
import ConfigQuery from 'queries/Config'
import LocaleDropdown from 'components/LocaleDropdown'
import CurrencyDropdown from 'components/CurrencyDropdown'
import DocumentTitle from 'components/DocumentTitle'
import Toggle from 'components/Toggle'

const configurableFields = [
  'bridge',
  'discovery',
  'ipfsGateway',
  'ipfsRPC',
  'provider',
  'providerWS',
  'performanceMode',
  'relayer'
]

class Settings extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ...Object.assign(...configurableFields.map(key => ({ [key]: '' }))),
      ...pick(this.props.config, configurableFields)
    }

    this.saveConfig = this.saveConfig.bind(this)
    this.toggleDeveloperMode = this.toggleDeveloperMode.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.config !== this.props.config) {
      this.setState({
        ...pick(this.props.config, configurableFields)
      })
    }
  }

  saveConfig(setNetwork, configUpdate = {}, restoreDefaults = false) {
    let customConfig = {}
    if (!restoreDefaults) {
      customConfig = {
        ...pick(this.state, configurableFields),
        ...configUpdate
      }
    }
    window.localStorage.customConfig = JSON.stringify(customConfig)
    setNetwork({
      variables: {
        network: window.localStorage.ognNetwork || 'mainnet',
        customConfig
      }
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

  toggleDeveloperMode(on) {
    this.setState({
      developerMode: on
    })
  }

  render() {
    const input = formInput(this.state, state => this.setState(state))
    const { locale, onLocale, currency, onCurrency } = this.props

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
            <div className="row">
              <div className="col-xl-8 offset-xl-2 col-lg-10 offset-lg-1">
                <h1>
                  <fbt desc="settings.heading">Settings</fbt>
                </h1>
                <div className="settings-group">
                  <div className="settings-box">
                    <div className="form-group row">
                      <div className="col-sm">
                        <label htmlFor="language">
                          <fbt desc="settings.languageLabel">Language</fbt>
                        </label>
                        <div className="form-text form-text-muted">
                          <small>
                            <fbt desc="settings.language">
                              Please make a selection from the list.
                            </fbt>
                          </small>
                        </div>
                      </div>
                      <div className="col-sm">
                        <LocaleDropdown
                          locale={locale}
                          onLocale={onLocale}
                          className="settings-dropdown float-right"
                          dropdown={true}
                        />
                      </div>
                    </div>

                    <div className="form-group row">
                      <div className="col-sm">
                        <label htmlFor="language">
                          <fbt desc="settings.currencyLabel">Currency</fbt>
                        </label>
                        <div className="form-text form-text-muted">
                          <small>
                            <fbt desc="settings.currency">
                              Please make a selection from the list below.
                            </fbt>
                          </small>
                        </div>
                      </div>
                      <div className="col-sm">
                        <CurrencyDropdown
                          value={currency}
                          onChange={onCurrency}
                          className="settings-dropdown float-right"
                        />
                      </div>
                    </div>

                    {/* TODO: this will require a grqphql mutation and mods to
                    @origin/messaging-client.

                    <div className="form-group row">
                      <div className="col">
                        <label htmlFor="Messaging">
                          <fbt desc="settings.messagingLabel">
                            Messaging
                          </fbt>
                        </label>
                        <div className="form-text form-text-muted">
                          <small><fbt desc="settings.messagingHint">Enable/disable messaging by clicking on the button.</fbt></small>
                        </div>
                      </div>
                      <div className="col">
                        <button className="btn btn-outline-danger float-right">
                          <fbt desc="settings.messagingButton">
                            Disable
                          </fbt>
                        </button>
                      </div>
                    </div>
                    */}
                  </div>
                </div>
                <div className="settings-group">
                  <div className="settings-box">
                    <div
                      className={`form-group row${
                        this.state.developerMode ? '' : ' no-border-bottom'
                      }`}
                    >
                      <div className="col">
                        <label htmlFor="performanceMode">
                          <fbt desc="settings.developerMode">
                            Developer Mode
                          </fbt>
                        </label>
                        <div className="form-text form-text-muted">
                          <small>
                            <fbt desc="settings.developerModeHint">
                              Provides more granular control over your
                              experience.
                            </fbt>
                          </small>
                        </div>
                      </div>
                      <div className="col">
                        <Toggle
                          toggled={true}
                          initialToggleState={this.state.developerMode}
                          className="float-right"
                          onClickHandler={this.toggleDeveloperMode}
                        />
                      </div>
                    </div>
                    <div
                      className={`developer${
                        this.state.developerMode ? '' : ' hide'
                      }`}
                    >
                      <div className="form-group row">
                        <div className="col-sm">
                          <label htmlFor="indexing">
                            <fbt desc="settings.ipfsLabel">IPFS Gateway</fbt>
                          </label>
                        </div>
                        <div className="col-sm">
                          <input
                            className="form-control form-control-lg"
                            type="text"
                            name="ipfsGateway"
                            {...input('ipfsGateway')}
                            onBlur={() => this.saveConfig(setNetwork)}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm">
                          <label htmlFor="indexing">
                            <fbt desc="settings.providerLabel">
                              Ethereum Node
                            </fbt>
                          </label>
                        </div>
                        <div className="col-sm">
                          <input
                            className="form-control form-control-lg"
                            type="text"
                            name="web3Provider"
                            {...input('provider')}
                            onBlur={() => this.saveConfig(setNetwork)}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm">
                          <label htmlFor="indexing">
                            <fbt desc="settings.bridgeLabel">Bridge Server</fbt>
                          </label>
                        </div>
                        <div className="col-sm">
                          <input
                            className="form-control form-control-lg"
                            type="text"
                            name="bridgeServer"
                            {...input('bridge')}
                            onBlur={() => this.saveConfig(setNetwork)}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm">
                          <label htmlFor="indexing">
                            <fbt desc="settings.discoveryLabel">
                              Discovery Server
                            </fbt>
                          </label>
                        </div>
                        <div className="col-sm">
                          <input
                            className="form-control form-control-lg"
                            type="text"
                            name="discovery"
                            {...input('discovery')}
                            onBlur={() => this.saveConfig(setNetwork)}
                          />
                        </div>
                      </div>
                      <div className="form-group row less-margin-bottom">
                        <div className="col-sm">
                          <label htmlFor="indexing">
                            <fbt desc="settings.relayerLabel">
                              Relayer Server
                            </fbt>
                          </label>
                        </div>
                        <div className="col-sm">
                          <input
                            className="form-control form-control-lg"
                            type="text"
                            name="relayer"
                            {...input('relayer')}
                            onBlur={() => this.saveConfig(setNetwork)}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <a
                          href="#"
                          className="container text-center restore"
                          onClick={ev => {
                            ev.preventDefault()
                            this.saveConfig(setNetwork, {}, true)
                          }}
                        >
                          Restore Defaults
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* TODO: See #2320
            <div className="settings-group">
              <div className="settings-box">
                <div className="form-group row">
                  <div className="col">
                    <label htmlFor="Messaging">
                      <fbt desc="settings.decentralizedLabel">
                        Decentralized Mode
                      </fbt>
                    </label>
                    <div className="form-text form-text-muted">
                      <small><fbt desc="settings.decentralizedHint">
                        Go fully decentralized but lose certain feaures like seach and free gas.
                      </fbt></small>
                    </div>
                  </div>
                  <div className="col">
                    <button className="btn btn-outline-danger float-right">
                      <fbt desc="settings.decentralizedButton">
                        Launch
                      </fbt>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            */}
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

    .form-text
      margin-top: -0.75rem
      margin-bottom: 0.5rem
      small
        font-size: 14px
        font-weight: 300

    .form-group
      margin-bottom: 1.5rem

      &.row
        border-bottom: solid 1px #c2cbd3
        background-color: var(--white)
        padding: 0 1rem 1rem 1rem

      &.row.less-margin-bottom
        margin-bottom: 1rem

      &.row:last-of-type,
      &.row.no-border-bottom
        border-bottom: 0
        padding: 0 1rem
        margin-bottom: 0

      label
        font-size: 18px
        margin-bottom: 0.75rem

      button
        margin-top: 0.5rem

      .form-text
        line-height: 0.75rem

  .settings-box
    margin-bottom: 1rem
    padding: 1rem
    border-radius: 14px
    border: solid 1px #c2cbd3
    background-color: var(--white)
    color: #000

    .hide
      display: none

    .toggle
      margin-top: 1rem

    .dropdown
      .dropdown-menu
        position: absolute
        left: 16px
        top: -3px
        width: 322px

    .settings-dropdown
      color: #000
      font-size: 1.25rem
      font-weight: normal
      padding: 0.5rem
      max-width: 320px
      width: 100%
      height: 50px
      border-radius: 5px
      border: solid 1px #6f8294
      background-color: #fafafa

      .dropdown-selected
        .arrow
          display: block
          margin: 0.25rem
          float: right
          content: " "
          height: 24px
          width: 24px
          background: url('images/keyboard-arrow-down-material.svg') no-repeat center

    .developer label
      line-height: calc(1.5em + 1rem + 2px)
      margin-bottom: 0
      font-size: 0.875rem

    .developer,
    .restore,
    input,
    label
      color: #000
      font-size: 0.875rem

    .restore
      color: var(--clear-blue)

  @media (max-width: 767.98px)
    .settings
      padding-top: 2rem
      h1
        font-size: 32px
        margin-bottom: 1rem
        line-height: 1.25
`)
