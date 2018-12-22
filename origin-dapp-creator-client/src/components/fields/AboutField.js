import React, { Component } from 'react'
import { InputGroup, FormGroup } from '@blueprintjs/core'

class AboutField extends Component {

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
          helperText="A description that will be displayed in the footer of your DApp"
          label="About"
          labelFor="about-field"
          labelInfo="(required)">
        <InputGroup
          name="about"
          placeholder="A place for buying and selling things"
          className="input-width"
          value={this.props.value}
          onChange={this.handleChange}
          required>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default AboutField
