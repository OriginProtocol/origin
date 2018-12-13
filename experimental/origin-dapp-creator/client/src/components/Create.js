import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Intent } from '@blueprintjs/core'
import request from 'request'

import AboutField from './fields/AboutField'
import TitleField from './fields/TitleField'
import LogoUrlField from './fields/LogoUrlField'
import IconUrlField from './fields/IconUrlField'
import SubdomainField from './fields/SubdomainField'

import ColorPicker from './ColorPicker'

class Create extends Component {
  constructor(props, context) {
    super(props)

    this.state = {
      config: {
        subdomain: '',
        title: '',
        about: '',
        cssVars: {
          dusk: '',
          goldenRod: '',
          paleGrey: ''
        }
      }
    }

    this.web3Context = context.web3

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleColorChange = this.handleColorChange.bind(this)
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
        ...this.state.config.cssVars,
        [name]: color.hex
      }
    })
  }

  async handlePublish () {
    // Sign configuration using web3
    web3.personal.sign(
      JSON.stringify(this.state.config),
      web3.eth.accounts[0],
      (error, signature) => {
        if (error) {
          console.log('Signing failed: ', error)
        } else {
          // Send signed configuration to server
          request.post(`${process.env.API_URL}/config`, {
            json: {
              config: this.state.config,
              signature: signature,
              address: web3.eth.accounts[0]
            }
          })
        }
      }
    )
  }

  render () {
    return (
      <div className="p-3">
        <h3>Create DApp Configuration</h3>

        <h4>Subdomain</h4>

        <SubdomainField value={this.state.config.subdomain}
          onChange={this.handleInputChange}>
        </SubdomainField>

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
          text="Publish Configuration"
          large={true}
          intent={Intent.PRIMARY}
          onClick={this.handlePublish}>
        </Button>
      </div>
    )
  }
}

Create.contextTypes = {
  web3: PropTypes.object
}

export default Create
