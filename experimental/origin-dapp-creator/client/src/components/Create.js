import React, { Component } from 'react'
import { Button, Intent } from '@blueprintjs/core'

import AboutField from './fields/AboutField'
import TitleField from './fields/TitleField'
import LogoUrlField from './fields/LogoUrlField'
import IconUrlField from './fields/IconUrlField'
import SubdomainField from './fields/SubdomainField'

import ColorPicker from './ColorPicker'

class Create extends Component {
  constructor(props) {
    super(props)

    this.state = {
      subdomain: '',
      title: '',
      about: '',
      cssVars: {
        dusk: '',
        goldenRod: '',
        paleGrey: ''
      }
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleColorChange = this.handleColorChange.bind(this)
    this.handlePublish = this.handlePublish.bind(this)
  }

  handleInputChange (event) {
    console.log(event)
    console.log(event.target.name)
    console.log(event.target.value)
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

  handlePublish () {
    alert(JSON.stringify(this.state))
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
          text="Publish Configuration"
          large={true}
          intent={Intent.PRIMARY}
          onClick={this.handlePublish}>
        </Button>
      </div>
    )
  }
}

export default Create
