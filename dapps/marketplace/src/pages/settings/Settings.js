import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/react-hooks'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import { formInput } from 'utils/formHelpers'
import withConfig from 'hoc/withConfig'
import withIsMobile from 'hoc/withIsMobile'
import SetNetwork from 'mutations/SetNetwork'
import ConfigQuery from 'queries/Config'
import LocaleDropdown from 'components/LocaleDropdown'
import CurrencyDropdown from 'components/CurrencyDropdown'
import DocumentTitle from 'components/DocumentTitle'
import Toggle from 'components/Toggle'

import TextRow from './_TextRow'
import ToggleRow from './_ToggleRow'

import Store from 'utils/store'
import WithdrawDust from './_WithdrawDust'
const store = Store('sessionStorage')

const configurableFields = [
  'bridge',
  'discovery',
  'growth',
  'ipfsGateway',
  'ipfsRPC',
  'provider',
  'providerWS',
  'performanceMode',
  'relayer',
  'graphql'
]

const Settings = props => {
  const { locale, onLocale, currency, onCurrency, isMobile, config } = props

  const [devMode, setDevMode] = useState(store.get('developerMode'))
  const [state, _setState] = useState({
    ...configurableFields.map(key => ({ [key]: '' })),
    ...pick(config, configurableFields)
  })

  const setState = newState => _setState({ ...state, ...newState })

  useEffect(() => setState(pick(config, configurableFields)), [config])

  const input = formInput(state, setState, { small: true })
  const [setNetwork] = useMutation(SetNetwork, {
    refetchQueries: () => [{ query: ConfigQuery }]
  })

  const saveConfig = (configUpdate = {}, restoreDefaults = false) => {
    let customConfig = {}
    if (!restoreDefaults) {
      customConfig = { ...pick(state, configurableFields), ...configUpdate }
    }
    window.localStorage.customConfig = JSON.stringify(customConfig)
    setNetwork({
      variables: {
        network: window.localStorage.ognNetwork || 'mainnet',
        customConfig
      }
    })
  }

  return (
    <div className="container settings">
      <DocumentTitle pageTitle={<fbt desc="settings.title">Settings</fbt>} />
      {!isMobile && (
        <h1>
          <fbt desc="settings.heading">Settings</fbt>
        </h1>
      )}
      <div className="settings-box">
        <div className="form-group">
          <div>
            <label>
              <fbt desc="settings.languageLabel">Language</fbt>
            </label>
            <small className="form-text form-text-muted">
              <fbt desc="settings.language">
                Please make a selection from the list.
              </fbt>
            </small>
          </div>
          <LocaleDropdown
            locale={locale}
            onLocale={onLocale}
            className="settings-dropdown"
            dropdown={true}
          />
        </div>

        <div className="form-group">
          <div>
            <label>
              <fbt desc="settings.currencyLabel">Currency</fbt>
            </label>
            <small className="form-text form-text-muted">
              <fbt desc="settings.currency">
                Please make a selection from the list below.
              </fbt>
            </small>
          </div>
          <CurrencyDropdown
            value={currency}
            onChange={onCurrency}
            className="settings-dropdown"
          />
        </div>
      </div>
      <div className="settings-box">
        <div className="form-group">
          <div>
            <label>
              <fbt desc="settings.developerMode">Developer Mode</fbt>
            </label>
            <small className="form-text form-text-muted">
              <fbt desc="settings.developerModeHint">
                Provides more granular control over your experience.
              </fbt>
            </small>
          </div>
          <Toggle
            value={devMode}
            className="float-right"
            onChange={on => {
              store.set('developerMode', on)
              setDevMode(on)
            }}
          />
        </div>
        {devMode && (
          <div className="developer">
            <TextRow {...input('ipfsGateway')} onBlur={() => saveConfig()}>
              <fbt desc="settings.ipfsLabel">IPFS Gateway</fbt>
            </TextRow>

            <TextRow {...input('provider')} onBlur={() => saveConfig()}>
              <fbt desc="settings.providerLabel">Ethereum Node</fbt>
            </TextRow>

            <TextRow {...input('bridge')} onBlur={() => saveConfig()}>
              <fbt desc="settings.bridgeLabel">Bridge Server</fbt>
            </TextRow>

            <TextRow {...input('discovery')} onBlur={() => saveConfig()}>
              <fbt desc="settings.discoveryLabel">Discovery Server</fbt>
            </TextRow>

            <TextRow {...input('growth')} onBlur={() => saveConfig()}>
              <fbt desc="settings.growthLabel">Growth Server</fbt>
            </TextRow>

            <TextRow {...input('relayer')} onBlur={() => saveConfig()}>
              <fbt desc="settings.relayerLabel">Relayer Server</fbt>
            </TextRow>

            <TextRow {...input('graphql')} onBlur={() => saveConfig()}>
              <fbt desc="settings.graphqlLabel">GraphQL Server</fbt>
            </TextRow>

            <ToggleRow config={config} field="performanceMode">
              <fbt desc="settings.performanceMode">Performance Mode</fbt>
            </ToggleRow>

            <ToggleRow config={config} field="proxyAccountsEnabled">
              <fbt desc="settings.proxyAccountsLabel">Proxy Accounts</fbt>
            </ToggleRow>

            <ToggleRow config={config} field="relayerEnabled">
              <fbt desc="settings.relayerToggleLabel">Relayer</fbt>
            </ToggleRow>

            <ToggleRow config={config} field="bypassOnboarding">
              <fbt desc="settings.onboardDisabled">Onboarding Disabled</fbt>
            </ToggleRow>

            <div className="form-group restore">
              <a
                href="#"
                onClick={e => {
                  e.preventDefault()
                  saveConfig(setNetwork, {}, true)
                }}
              >
                <fbt desc="settings.restoreDefaults">Restore Defaults</fbt>
              </a>
            </div>

            <WithdrawDust />
          </div>
        )}
      </div>
      {devMode && (
        <div className="text-center test-builds">
          <a href="https://originprotocol.github.io/test-builds/">
            Test Builds
          </a>
        </div>
      )}
    </div>
  )
}

export default withIsMobile(withConfig(Settings))

require('react-styl')(`
  .settings
    padding-top: 3rem
    max-width: 720px

    .settings-dropdown
      display: flex
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

    .settings-box
      margin-bottom: 1rem
      border-radius: 1rem
      border: solid 1px #c2cbd3
      color: #000

      .form-group
        display: flex
        align-items: center
        justify-content: space-between
        padding: 1.5rem 2rem
        border-bottom: 1px solid #c2cbd3
        margin: 0
        label
          margin-bottom: 0
          font-size: 18px
          color: var(--dark)
          flex: 1
        &:last-of-type
          border-bottom: 0
          border-radius: 0 0 1rem 1rem
        .form-text
          font-size: 14px
          font-weight: 300
          margin: 0
        input
          flex: 1
        &.restore
          padding: 0.75rem
          justify-content: center
          font-size: 14px

    .settings-box .developer .form-group
      label
        font-size: 14px

    .test-builds
      font-size: 14px

  @media (max-width: 767.98px)
    .settings
      padding-top: 2rem
      padding-bottom: 4rem
      h1
        font-size: 32px
        margin-bottom: 1rem
        line-height: 1.25

      .settings-box
        .form-group
          flex-direction: column
          align-items: flex-start
          padding: 1rem 1.5rem
          label
            margin: 0 0 0.5rem 0
          .form-text
            margin-bottom: 0.5rem
        .developer .form-group
          label
            margin: 0 0 0.5rem 0
`)
