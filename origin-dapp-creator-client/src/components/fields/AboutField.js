import React, { Component } from 'react'
import { TextArea, FormGroup } from '@blueprintjs/core'

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
        <TextArea
          name="about"
          placeholder="A place for buying and selling things"
          value={this.props.value}
          onChange={this.handleChange}
          large
          fill
          required />
      </FormGroup>
    )
  }
}

export default AboutField
