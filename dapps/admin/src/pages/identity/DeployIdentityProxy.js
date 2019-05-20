import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button } from '@blueprintjs/core'

import { Dialog, FormGroup } from '@blueprintjs/core'

import rnd from 'utils/rnd'
import withAccounts from 'hoc/withAccounts'
import { DeployIdentityViaProxyMutation } from 'queries/Mutations'

import SelectAccount from 'components/SelectAccount'
import ErrorCallout from 'components/ErrorCallout'

class DeployIdentityProxy extends Component {
  constructor(props) {
    super(props)
    const acct = rnd(props.accounts)
    this.state = {
      from: acct ? acct.id : ''
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
        mutation={DeployIdentityViaProxyMutation}
        onCompleted={this.props.onCompleted}
      >
        {(deployIdentity, { loading, error }) => (
          <Dialog
            title="Deploy Identity Proxy"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <FormGroup label="Owner">
                  <SelectAccount {...input('from')} />
                </FormGroup>
              </div>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Deploy Identity Proxy"
                  intent="primary"
                  loading={loading}
                  onClick={() =>
                    deployIdentity({
                      variables: {
                        from: this.state.from,
                        owner: this.state.from
                      }
                    })
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

export default withAccounts(DeployIdentityProxy)
