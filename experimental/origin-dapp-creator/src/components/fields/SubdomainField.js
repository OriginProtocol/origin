import React, { Component } from 'react'
import { Button, InputGroup, FormGroup } from '@blueprintjs/core'

class SubdomainField extends Component {

  handleChange () {
    console.log('Got change')
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
          placeholder="marketplace"
          className="input-width"
          rightElement={fieldSuffix}>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default SubdomainField
