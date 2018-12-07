import React, { Component } from 'react'
import { InputGroup, FormGroup } from '@blueprintjs/core'

class IconUrlField extends Component {
  render () {
    return (
      <FormGroup
          helperText="The URL to the icon to be displayed in your DApp"
          label="Icon URL"
          labelFor="icon-url-field"
          labelInfo="(required)">
        <InputGroup
          placeholder="https://dapp.originprotocol.com/images/origin-icon-white.svg"
          className="input-width-wide">
        </InputGroup>
      </FormGroup>
    )
  }
}

export default IconUrlField
