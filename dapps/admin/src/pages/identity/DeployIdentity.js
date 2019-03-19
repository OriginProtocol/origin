import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button } from '@blueprintjs/core'

import { Dialog, FormGroup, InputGroup } from '@blueprintjs/core'

import rnd from 'utils/rnd'
import withAccounts from 'hoc/withAccounts'
import { DeployIdentityMutation } from 'queries/Mutations'

import SelectAccount from 'components/SelectAccount'
import ErrorCallout from 'components/ErrorCallout'

class DeployIdentity extends Component {
  constructor(props) {
    super(props)
    const acct = rnd(props.accounts)
    this.state = {
      from: acct ? acct.id : '',
      firstName: '',
      lastName: '',
      description: '',
      avatar: '',
      attestations: []
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.accounts.length > prevProps.accounts.length &&
      !prevState.from
    ) {
      const acct = rnd(this.props.accounts)
      this.setState({ from: acct.id })
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })

    return (
      <Mutation
        mutation={DeployIdentityMutation}
        onCompleted={this.props.onCompleted}
      >
        {(deployIdentity, { loading, error }) => (
          <Dialog
            title="Deploy Identity"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="First Name">
                    <InputGroup {...input('firstName')} />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FormGroup label="First Name">
                    <InputGroup {...input('lastName')} />
                  </FormGroup>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Owner">
                    <SelectAccount {...input('from')} />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FormGroup label="Description">
                    <InputGroup {...input('description')} />
                  </FormGroup>
                </div>
              </div>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Deploy Identity"
                  intent="primary"
                  loading={loading}
                  onClick={() => deployIdentity(this.getVars())}
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }

  getVars() {
    const {
      from,
      attestations,
      firstName,
      lastName,
      description,
      avatar
    } = this.state
    return {
      variables: {
        from,
        attestations,
        profile: {
          firstName,
          lastName,
          description,
          avatar
        }
      }
    }
  }
}

export default withAccounts(DeployIdentity)
