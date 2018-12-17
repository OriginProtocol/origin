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

import { AppToaster } from '../toaster'

import { baseConfig } from 'origin-dapp/src/config'

class Create extends Component {
  constructor(props, context) {
    super(props)

    this.state = {
      config: baseConfig,
      publishing: false,
      previewing: false
    }

    this.web3Context = context.web3

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleColorChange = this.handleColorChange.bind(this)
    this.handlePreview = this.handlePreview.bind(this)
    this.handlePublish = this.handlePublish.bind(this)
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

  async handlePublish () {
    this.setState({ publishing: true })
    // Sign configuration using web3
    web3.personal.sign(
      JSON.stringify(this.state.config),
      web3.eth.accounts[0],
      (error, signature) => {
        if (error) {
          console.log('Signing failed: ', error)
          AppToaster.show({
            message: 'There was an error signing your DApp configuration'
          })
          this.setState({ publishing: false })
        } else {
          // Send signed configuration to server
          superagent.post(`${process.env.API_URL}/config`)
            .send({
              config: this.state.config,
              signature: signature,
              address: web3.eth.accounts[0]
            })
            .catch(() => {
              AppToaster.show({
                message: 'There was an error publishing your DApp configuration'
              })
            })
            .finally(() => {
              this.setState({ publishing: false })
            })
        }
      }
    )
  }

  async handlePreview () {
    this.setState({ previewing: true })
    const response = await superagent
      .post(`${process.env.API_URL}/config/preview`)
      .send(this.state.config)

    this.setState({ previewing: false })

    const ipfsPath = `${process.env.IPFS_GATEWAY_URL}/ipfs/${response.text}`
    window.open(`${process.env.DAPP_URL}/?config=${ipfsPath}`, '_blank')
  }

  render () {
    return (
      <div className="p-3">
        <h3>Create DApp Configuration</h3>

        <h4>Domain</h4>

        <DomainField value={this.state.config.subdomain}
          onChange={this.handleInputChange}>
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

        <Button className="mt-3"
            large={true}
            intent={Intent.PRIMARY}
            onClick={this.handlePublish}
            disabled={this.state.publishing}>
          {this.state.publishing ? 'Loading' : 'Publish' }
        </Button>

        <Button className="ml-2 mt-3"
            large={true}
            onClick={this.handlePreview}>
          {this.state.previewing ? 'Loading' : 'Preview' }
        </Button>
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
