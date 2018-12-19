import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Intent } from '@blueprintjs/core'
import superagent from 'superagent'

import AboutField from 'components/fields/AboutField'
import TitleField from 'components/fields/TitleField'
import LanguageCodeField from 'components/fields/LanguageCodeField'
import LogoUrlField from 'components/fields/LogoUrlField'
import IconUrlField from 'components/fields/IconUrlField'
import DomainField from 'components/fields/DomainField'
import ColorPicker from 'components/ColorPicker'
import SuccessDialog from 'components/dialogs/SuccessDialog'
import { AppToaster } from '../toaster'

import { baseConfig } from 'origin-dapp/src/config'

class Create extends Component {
  constructor(props, context) {
    super(props)

    this.state = {
      config: baseConfig,
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
    this.setState({
      'config': {
        ...this.state.config,
        [event.target.name]: event.target.value
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

  async handleSubmit (event) {
    event.preventDefault()

    this.setState({ publishing: true })

    const dataToSign = JSON.stringify(this.state.config)
    web3.personal.sign(dataToSign, web3.eth.accounts[0], (err, sig) => {
      // Send signed configuration to server
      return superagent.post(`${process.env.API_URL}/config`)
        .send({ config: this.state.config, signature: sig, address: web3.eth.accounts[0] })
        .catch(this.handleServerErrors)
        .then(() => { this.setState({ successDialogIsOpen: true }) })
        .finally(() => this.setState({ publishing: false }))
    })
  }

  async handlePreview () {
    this.setState({ previewing: true })

    let response
    try {
      response = await superagent
        .post(`${process.env.API_URL}/config/preview`)
        .send(this.state.config)
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
        <h3>Create DApp Configuration</h3>

        <form onSubmit={this.handleSubmit}>
          <h4>Domain</h4>

          <DomainField value={this.state.config.subdomain}
            onChange={this.handleInputChange}
            error={this.state.errors.subdomain}>
          </DomainField>

          <h4>Title & Description</h4>

          <TitleField value={this.state.config.title}
            onChange={this.handleInputChange}>
          </TitleField>

          <AboutField value={this.state.config.about}
            onChange={this.handleInputChange}>
          </AboutField>

          <h4>Logos and Icons</h4>

          <LogoUrlField value={this.state.config.logoUrl}
            onChange={this.handleInputChange}>
          </LogoUrlField>

          <IconUrlField value={this.state.config.iconUrl}
            onChange={this.handleInputChange}>
          </IconUrlField>

          <h4>Languages</h4>

          <LanguageCodeField value={this.state.config.locale}
            onChange={this.handleInputChange}>
          </LanguageCodeField>

          <h4>Colors</h4>

          <ColorPicker label="Navbar Background"
            name="dusk"
            value={this.state.config.cssVars.dusk}
            onChange={this.handleColorChange}>
          </ColorPicker>

          <ColorPicker label="Searchbar Background"
            name="paleGrey"
            value={this.state.config.cssVars.paleGrey}
            onChange={this.handleColorChange}>
          </ColorPicker>

          <ColorPicker label="Featured Tag"
            name="goldenRod"
            value={this.state.config.cssVars.goldenRod}
            onChange={this.handleColorChange}>
          </ColorPicker>

          <Button type="submit"
              id="publish-button"
              className="mt-3"
              large={true}
              intent={Intent.PRIMARY}
              disabled={this.state.publishing}>
            {this.state.publishing ? 'Loading' : 'Publish' }
          </Button>

          <Button type="submit"
              className="ml-2 mt-3"
              id="preview-button"
              onClick={this.handlePreview}
              large={true}
              disabled={this.state.previewing}>
            {this.state.previewing ? 'Loading' : 'Preview' }
          </Button>
        </form>

        <SuccessDialog
          isOpen={this.state.successDialogIsOpen}
          subdomain={this.state.config.subdomain} />
      </div>
    )
  }
}

Create.contextTypes = {
  web3: PropTypes.object
}

export default Create

require('react-styl')(`
  h4
    margin-top: 2rem;
`)
