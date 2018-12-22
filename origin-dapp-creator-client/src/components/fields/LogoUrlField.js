import React, { Component } from 'react'
import { InputGroup, FormGroup } from '@blueprintjs/core'

class LogoUrlField extends Component {
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
          helperText="The URL to the logo to be displayed in your DApp"
          label="Logo URL"
          labelFor="logo-url-field">
        <InputGroup
          name="logoUrl"
          placeholder="https://www.originprotocol.com/static/img/origin-logo-dark.png"
          className="input-width-wide"
          value={this.props.value}
          onChange={this.handleChange}>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default LogoUrlField
