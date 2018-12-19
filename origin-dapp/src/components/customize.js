import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router'

import { fetchConfig } from 'actions/Config'
import store from 'store'

class Customize extends Component {

  componentDidMount() {
    let configUrl
    if (window.location.hostname.includes('origindapp.com')) {
      const ipfs = process.env.IPFS_GATEWAY_PROTOCOL +
        `://${process.env.IPFS_DOMAIN}` +
        `:${process.env.IPFS_GATEWAY_PORT}`
      configUrl = `${ipfs}/ipns/origin.${window.location.hostname}`
    } else {
      const configUrlMatch = window.location.search.match(/config=([^#]*)/)
      configUrl = configUrlMatch ? decodeURIComponent(configUrlMatch[1]) : false
    }

    if (configUrl) {
      console.log(`Configuring from file at ${configUrl}`)
    }

    this.props.fetchConfig(configUrl)
      .then(() => {
        // CSS vars
        for (let [cssVarName, cssVarValue] of Object.entries(this.props.config.cssVars)) {
          if (cssVarValue.toString().match(/url *\(/)) {
            throw "url() not allowed in DApp custom CSS"
          }

          document.documentElement.style.setProperty(
            `--${camelToDash(cssVarName)}`,
            cssVarValue
          )
        }

        // Page title
        if (this.props.config.title) {
          document.title = this.props.config.title
        }

        // Locale
        if (this.props.config.languageCode) {
          if (this.props.config.languageCode !== this.props.selectedLanguageCode) {
            store.set('preferredLang', this.props.config.languageCode)
            window.location.reload()
          }
        }
      })
  }

  render() {
    return this.props.children
  }
}

// Utility function to convert camel cased JavaScript variables into dashed CSS variables
const camelToDash = str => str
  .replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
  .replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`)

const mapStateToProps = state => {
  return {
    config: state.config,
    selectedLanguageCode: state.app.translations.selectedLanguageCode
  }
}

const mapDispatchToProps = dispatch => ({
  fetchConfig: url => dispatch(fetchConfig(url))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(Customize))
)
