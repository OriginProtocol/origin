import React, { Component } from 'react'
import { InputGroup, FormGroup } from '@blueprintjs/core'

class AboutField extends Component {

  handleChange () {
    console.log('Got change')
  }

  render () {
    return (
      <FormGroup
          helperText="A description that will be displayed in the footer of your DApp"
          label="About"
          labelFor="about-field"
          labelInfo="(required)">
        <InputGroup
          placeholder="A place for buying and selling things"
          className="input-width">
        </InputGroup>
      </FormGroup>
    )
  }
}

export default AboutField
