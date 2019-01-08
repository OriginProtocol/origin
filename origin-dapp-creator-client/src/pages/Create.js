import { Button, Intent } from '@blueprintjs/core'
import { baseConfig } from 'origin-dapp/src/config'
import PropTypes from 'prop-types'
import React from 'react'
import superagent from 'superagent'

import { AppToaster } from '../toaster'
import Steps from 'components/Steps'

import { getAvailableLanguages } from 'origin-dapp/src/utils/translationUtils.js'

class Form extends React.Component {
  constructor(props, context) {
    super(props)

    this.state = {
      config: baseConfig,
      ipfsHash: '',
      submitting: false,
      previewing: false,
      successDialogIsOpen: false,
      errors: {
        subdomain: ''
      }
    }

    this.availableLanguages = getAvailableLanguages().map((language) => {
      return {
        value: language.selectedLanguageCode,
        label: language.selectedLanguageFull
      }
    })
    // Add English to the list of available languages
    this.availableLanguages.unshift({ value: 'en-US', label: 'English' })

    this.availableLanguageOptions = this.availableLanguages.map((x) => {
      return (<option key={x.value} value={x.value}>{x.label}</option>)
    })

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleInputChange (event) {
    let value
    // Hacky handling of use custom domain switch
    if (event.target.name == 'subdomain' && event.target.type == 'checkbox') {
      value = event.target.checked ? false : ''
    } else {
      value = event.target.value
    }

    this.setState({
      'config': {
        ...this.state.config,
        [event.target.name]: value
      }
    })
  }

  handleSubmit (event) {
    console.log('Submit')
  }

  render () {
    return (
      <>
        <h1>Welcome to the Origin Marketplace Creator</h1>
        <h4>Please provide the information below to get started.</h4>

        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label>Marketplace Title</label>
            <input className="form-control form-control-lg" />
          </div>

          <div className="form-group">
            <label>Subdomain</label>
            <input className="form-control form-control-lg" />
            <div className="helper-text">
              You can use your own custom domain name. <a href="#">Here's how</a>
            </div>
          </div>

          <div className="form-group">
            <label>About</label>
            <textarea className="form-control form-control-lg" />
            <div className="helper-text">
              A description that will be displayed in the footer of your DApp
            </div>
          </div>

          <div className="form-group">
            <label>Language</label>
            <select className="form-control form-control-lg"
              value={this.state.language}
              onChange={e => this.props.updateState(e.target.value) }
            >
              {this.availableLanguageOptions}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg">
              Continue
            </button>
          </div>
        </form>
      </>
    )
  }
}

Form.contextTypes = {
  web3: PropTypes.object
}

export default Form

require('react-styl')(``)
