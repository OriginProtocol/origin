import React, { Component } from 'react'
import { InputGroup, FormGroup } from '@blueprintjs/core'

class TitleField extends Component {
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
          helperText="The title of your DApp"
          label="Title"
          labelFor="title-field"
          labelInfo="(required)">
        <InputGroup
          name="title"
          placeholder="Decentralized Marketplace"
          className="input-width"
          value={this.props.value}
          onChange={this.handleChange}>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default TitleField
