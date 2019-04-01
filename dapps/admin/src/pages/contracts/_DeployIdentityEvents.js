import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button } from '@blueprintjs/core'

import { Dialog, FormGroup, HTMLSelect } from '@blueprintjs/core'

import ErrorCallout from 'components/ErrorCallout'
import withAccounts from 'hoc/withAccounts'
import { DeployIdentityEventsContractMutation } from 'queries/Mutations'
import rnd from 'utils/rnd'

class DeployIdentityEventsContract extends Component {
  constructor(props) {
    super(props)
    let admin = rnd(props.accounts.filter(a => a.role === 'Admin'))
    if (!admin) admin = rnd(props.accounts)
    this.state = {
      from: admin ? admin.id : '',
      contract: props.contract
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })

    return (
      <Mutation
        mutation={DeployIdentityEventsContractMutation}
        onCompleted={this.props.onCompleted}
      >
        {(deployIdentityContract, { loading, error }) => (
          <Dialog
            title={this.props.title}
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <FormGroup label="Owner">
                <HTMLSelect
                  {...input('from')}
                  fill={true}
                  options={this.props.accounts.map(a => ({
                    label: `${(a.name || a.id).substr(0, 24)}`,
                    value: a.id
                  }))}
                />
              </FormGroup>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Deploy Identity Events"
                  intent="primary"
                  loading={loading}
                  onClick={() =>
                    deployIdentityContract({ variables: this.state })
                  }
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }
}

export default withAccounts(DeployIdentityEventsContract)
