import React from 'react'
import { Button, Intent, InputGroup, FormGroup } from '@blueprintjs/core'

class SubdomainField extends React.Component {
  constructor (props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
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
          helperText={this.props.error}
          intent={this.props.error ? Intent.DANGER : Intent.NONE }>
        <InputGroup
          name="subdomain"
          placeholder="marketplace"
          rightElement={fieldSuffix}
          value={this.props.value}
          onChange={this.handleChange}
          intent={this.props.error ? Intent.DANGER : Intent.NONE }
          fill
          large
          required>
        </InputGroup>
      </FormGroup>
    )
  }
}

export default SubdomainField
