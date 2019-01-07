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
          label="Marketplace Title"
          labelFor="title-field">
        <InputGroup
          name="title"
          placeholder="Decentralized Marketplace"
          value={this.props.value}
          onChange={this.handleChange}
          large
          fill
          required>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default TitleField
