import React, { Component } from 'react'
import { Button, InputGroup, FormGroup } from '@blueprintjs/core'

class SubdomainField extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    // TODO validate subdomain does not have an entry already
    this.props.onChange(event)
  }

  render () {
    const fieldSuffix = (
      <Button disabled={true}>.origindapp.com</Button>
    )

    return (
      <FormGroup
          label="Subdomain"
          labelFor="subdomain-field"
          labelInfo="(required)">
        <InputGroup
          name="subdomain"
          placeholder="marketplace"
          className="input-width"
          rightElement={fieldSuffix}
          value={this.props.value}
          onChange={this.handleChange}>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default SubdomainField
