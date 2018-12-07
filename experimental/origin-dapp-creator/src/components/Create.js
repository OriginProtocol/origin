import React, { Component } from 'react'
import { Button, Intent } from '@blueprintjs/core'

import AboutField from './fields/AboutField'
import TitleField from './fields/TitleField'
import LogoUrlField from './fields/LogoUrlField'
import IconUrlField from './fields/IconUrlField'
import SubdomainField from './fields/SubdomainField'

import ColorPicker from './ColorPicker'

class Create extends Component {
  render () {
    return (
      <div className="p-3">
        <h3>Create DApp Configuration</h3>

        <h4>Subdomain</h4>
        <SubdomainField></SubdomainField>

        <h4>Title & Description</h4>

        <TitleField></TitleField>
        <AboutField></AboutField>

        <h4>Logos and Icons</h4>

        <LogoUrlField></LogoUrlField>
        <IconUrlField></IconUrlField>

        <h4>Colors</h4>

        <ColorPicker label="Navbar" color="#ffcc00"></ColorPicker>
        <ColorPicker label="Featured Tag" color="#ffcc00"></ColorPicker>
        <ColorPicker label="Currency" color="#ffcc00"></ColorPicker>

        <Button className="mt-3"
          text="Publish Configuration"
          large={true}
          intent={Intent.PRIMARY}>
        </Button>
      </div>
    )
  }
}

export default Create
