import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Intent } from '@blueprintjs/core'
import superagent from 'superagent'

import AboutField from './fields/AboutField'
import TitleField from './fields/TitleField'
import LogoUrlField from './fields/LogoUrlField'
import IconUrlField from './fields/IconUrlField'
import SubdomainField from './fields/SubdomainField'

import ColorPicker from './ColorPicker'

import { baseConfig } from 'origin-dapp/src/config'

class Create extends Component {
  constructor(props, context) {
    super(props)

    this.state = baseConfig

    this.web3Context = context.web3

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleColorChange = this.handleColorChange.bind(this)
    this.handlePreview = this.handlePreview.bind(this)
    this.handlePublish = this.handlePublish.bind(this)
  }

  handleInputChange (event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleColorChange (name, color) {
    this.setState({
      'cssVars': {
        ...this.state.cssVars,
        [name]: color.hex
      }
    })
  }

  async handlePublish () {
    // Sign configuration using web3
    web3.personal.sign(
      JSON.stringify(this.state),
      web3.eth.accounts[0],
      (error, signature) => {
        if (error) {
          console.log('Signing failed: ', error)
        } else {
          // Send signed configuration to server
          superagent.post(`${process.env.API_URL}/config`)
            .send({
              config: this.state,
              signature: signature,
              address: web3.eth.accounts[0]
            })
        }
      }
    )
  }

  async handlePreview () {
    const response = await superagent.post(`${process.env.API_URL}/config/preview`)
      .send(this.state)
    const ipfsHash = response.body[0].hash
    const ipfsPath = `${process.env.IPFS_GATEWAY_URL}/ipfs/${ipfsHash}`
    window.open(`${process.env.DAPP_URL}?config=${ipfsPath}`, '_blank')
  }

  render () {
    return (
      <div className="p-3">
        <h3>Create DApp Configuration</h3>

        <h4>Subdomain</h4>

        <SubdomainField value={this.state.subdomain}
          onChange={this.handleInputChange}>
        </SubdomainField>

        <h4>Title & Description</h4>

        <TitleField value={this.state.title}
          onChange={this.handleInputChange}>
        </TitleField>
        <AboutField value={this.state.about}
          onChange={this.handleInputChange}>
        </AboutField>

        <h4>Logos and Icons</h4>

        <LogoUrlField value={this.state.logoUrl}
          onChange={this.handleInputChange}>
        </LogoUrlField>
        <IconUrlField value={this.state.iconUrl}
          onChange={this.handleInputChange}>
        </IconUrlField>

        <h4>Colors</h4>

        <ColorPicker label="Navbar Background"
          name="dusk"
          value={this.state.cssVars.dusk}
          onChange={this.handleColorChange}>
        </ColorPicker>
        <ColorPicker label="Searchbar Background"
          name="paleGrey"
          value={this.state.cssVars.paleGrey}
          onChange={this.handleColorChange}>
        </ColorPicker>
        <ColorPicker label="Featured Tag"
          name="goldenRod"
          value={this.state.cssVars.goldenRod}
          onChange={this.handleColorChange}>
        </ColorPicker>

        <Button className="mt-3"
          text="Publish"
          large={true}
          intent={Intent.PRIMARY}
          onClick={this.handlePublish}>
        </Button>

        <Button className="ml-2 mt-3"
          text="Preview"
          large={true}
          onClick={this.handlePreview}>
        </Button>
      </div>
    )
  }
}

Create.contextTypes = {
  web3: PropTypes.object
}

export default Create
