import React, { Component } from 'react'
import { InputGroup, FormGroup } from '@blueprintjs/core'

class LogoUrlField extends Component {
  render () {
    return (
      <FormGroup
          helperText="The URL to the logo to be displayed in your DApp"
          label="Logo URL"
          labelFor="logo-url-field"
          labelInfo="(required)">
        <InputGroup
          placeholder="https://www.originprotocol.com/static/img/origin-logo-dark.png"
          className="input-width-wide">
        </InputGroup>
      </FormGroup>
    )
  }
}

export default LogoUrlField
