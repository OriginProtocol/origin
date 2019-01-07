import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Intent } from '@blueprintjs/core'
import superagent from 'superagent'

import AboutField from 'components/fields/AboutField'
import TitleField from 'components/fields/TitleField'
import LanguageCodeField from 'components/fields/LanguageCodeField'
import LogoUrlField from 'components/fields/LogoUrlField'
import IconUrlField from 'components/fields/IconUrlField'
import SubdomainField from 'components/fields/SubdomainField'
import ColorPicker from 'components/ColorPicker'
import SuccessDialog from 'components/dialogs/SuccessDialog'
import LoadDialog from 'components/dialogs/LoadDialog'
import { AppToaster } from '../toaster'

import { baseConfig } from 'origin-dapp/src/config'

class Form extends Component {
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

    this.web3Context = context.web3

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleColorChange = this.handleColorChange.bind(this)
    this.handlePreview = this.handlePreview.bind(this)
    this.handleServerErrors = this.handleServerErrors.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
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

  handleColorChange (name, color) {
    this.setState({
      'config': {
        ...this.state.config,
        'cssVars': {
          ...this.state.config.cssVars,
          [name]: color.hex
        }
      }
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

  async handleSubmit (event) {
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

  async handlePreview () {
    this.setState({ previewing: true })

    let response
    try {
      response = await superagent
        .post(`${process.env.DAPP_CREATOR_API_URL}/config/preview`)
        .send({ config: this.state.config })
    } catch(error) {
      console.log('An error occurred generating preview: ' + error)
      return
    } finally {
      this.setState({ previewing: false })
    }

    const ipfsPath = `${process.env.IPFS_GATEWAY_URL}/ipfs/${response.text}`
    window.open(`${process.env.DAPP_URL}/?config=${ipfsPath}`, '_blank')
  }

  render () {
    return (
      <div className="p-3">
        <h1>Welcome to the Origin Marketplace Creator</h1>
        <p>Please provide the information below to get started.</p>

        <form onSubmit={this.handleSubmit}>

          <TitleField value={this.state.config.title}
            onChange={this.handleInputChange}>
          </TitleField>

          {/*
          <Switch
            name="subdomain"
            onChange={this.handleInputChange}
            labelElement={<>Use your own domain</>}>
          </Switch>
          */}

          {this.state.config.subdomain !== false && (
            <SubdomainField value={this.state.config.subdomain}
              onChange={this.handleInputChange}
              error={this.state.errors.subdomain}
              helper="You can use your own custom domain name. Here's how">
            </SubdomainField>
          )}

          <AboutField value={this.state.config.about}
            onChange={this.handleInputChange}>
          </AboutField>

          <LanguageCodeField value={this.state.config.locale}
            onChange={this.handleInputChange}>
          </LanguageCodeField>

          <Button type="submit"
              id="publish-button"
              className="mt-3"
              large={true}
              intent={Intent.PRIMARY}>
            Continue
          </Button>
        </form>

        <SuccessDialog
          isOpen={this.state.successDialogIsOpen}
          config={this.state.config}
          ipfsHash={this.state.ipfsHash}
          onClose={() => this.setState({ successDialogIsOpen: false })} />

        <LoadDialog
          isOpen={this.state.loadDialogIsOpen}
          onClose={() => this.setState({ loadDialogIsOpen: false })} />
      </div>
    )
  }
}

Form.contextTypes = {
  web3: PropTypes.object
}

export default Form

require('react-styl')(`
  h4
    margin-top: 2rem;
`)
