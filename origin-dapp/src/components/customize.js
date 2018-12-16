import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { fetchConfig } from 'actions/Config'

class Customize extends Component {

  componentDidMount() {
    const configUrlMatch = window.location.search.match(/config=([^#]*)/)
    const configUrl = configUrlMatch ? decodeURIComponent(configUrlMatch[1]) : false

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

const mapStateToProps = ({ config }) => {
  return {
    config: config
  }
}

const mapDispatchToProps = dispatch => ({
  fetchConfig: url => dispatch(fetchConfig(url))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Customize))
