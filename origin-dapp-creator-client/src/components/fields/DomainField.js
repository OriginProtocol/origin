import React from 'react'
import { Button, Intent, HTMLSelect, InputGroup, FormGroup } from '@blueprintjs/core'

class DomainField extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      domainType: 'Subdomain'
    }

    this.handleDomainTypeChange = this.handleDomainTypeChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleDomainTypeChange (event) {
    this.setState({
      domainType: event.target.value
    })
  }

  handleChange (event) {
    this.props.onChange(event)
  }

  render () {
    const fieldSuffix = (
      <Button disabled={true}>.origindapp.com</Button>
    )

    return (
      <>
        <FormGroup
            label="Domain type"
            label-for="domain-type-field"
            labelInfo="(required)">
          <HTMLSelect
            options={['Subdomain', 'Custom Domain']}
            onChange={this.handleDomainTypeChange} />
        </FormGroup>

        {this.state.domainType == 'Subdomain' &&
          <FormGroup
              label="Subdomain"
              labelFor="subdomain-field"
              labelInfo="(required)"
              helperText={this.props.error}
              intent={this.props.error ? Intent.DANGER : Intent.NONE }>
            <InputGroup
              name="subdomain"
              placeholder="marketplace"
              className="input-width"
              rightElement={fieldSuffix}
              value={this.props.value}
              onChange={this.handleChange}
              intent={this.props.error ? Intent.DANGER : Intent.NONE }
              required>
            </InputGroup>
          </FormGroup>
        }
      </>
    )
  }
}

export default DomainField
