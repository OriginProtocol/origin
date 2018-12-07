import React, { Component } from 'react'
import { InputGroup, FormGroup } from '@blueprintjs/core'

class TitleField extends Component {
  render () {
    return (
      <FormGroup
          helperText="The title of your DApp"
          label="Title"
          labelFor="title-field"
          labelInfo="(required)">
        <InputGroup
          placeholder="Decentralized Marketplace"
          className="input-width">
        </InputGroup>
      </FormGroup>
    )
  }
}

export default TitleField
