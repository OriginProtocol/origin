import React, { Component } from 'react'
import { InputGroup, FormGroup } from '@blueprintjs/core'

class IconUrlField extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.props.onChange(event)
  }

  render () {
    return (
      <FormGroup
          helperText="The URL to the icon to be displayed in your DApp"
          label="Icon URL"
          labelFor="icon-url-field">
        <InputGroup
          name="iconUrl"
          placeholder="https://dapp.originprotocol.com/images/origin-icon-white.svg"
          className="input-width-wide"
          value={this.props.value}
          onChange={this.handleChange}>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default IconUrlField
