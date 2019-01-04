import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import {
  Button,
  Dialog,
  FormGroup,
  InputGroup,
  HTMLSelect
} from '@blueprintjs/core'

import withAccounts from 'hoc/withAccounts'
import { WithdrawListingMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class WithdrawListing extends Component {
  constructor(props) {
    super()

    this.state = {
      reason: '',
      target: props.listing.seller.id
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })

    return (
      <Mutation
        mutation={WithdrawListingMutation}
        onCompleted={this.props.onCompleted}
      >
        {(withdrawListing, { loading, error }) => (
          <Dialog
            title="Withdraw Listing"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Refund OGN to">
                    <HTMLSelect
                      fill={true}
                      {...input('target')}
                      options={this.props.accounts.map(a => ({
                        label: `${(a.name || a.id).substr(0, 24)}${
                          a.role ? ` (${a.role})` : ''
                        }`,
                        value: a.id
                      }))}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 2 }}>
                  <FormGroup label="Reason">
                    <InputGroup {...input('reason')} />
                  </FormGroup>
                </div>
              </div>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Withdraw Listing"
                  intent="primary"
                  loading={loading}
                  onClick={() => withdrawListing(this.getVars())}
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }

  getVars() {
    return {
      variables: {
        listingID: String(this.props.listing.id),
        from: this.props.listing.arbitrator.id,
        target: this.state.target
      }
    }
  }
}

export default withAccounts(WithdrawListing, 'marketplace')
