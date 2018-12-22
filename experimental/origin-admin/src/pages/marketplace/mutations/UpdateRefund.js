import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { Button, Dialog, FormGroup, InputGroup, Tag } from '@blueprintjs/core'

import { UpdateRefundMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class UpdateRefund extends Component {
  constructor(props) {
    super(props)
    const refund = props.offer.refund || '0'
    this.state = {
      amount: web3.utils.fromWei(refund, 'ether'),
      reason: ''
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    return (
      <Mutation
        mutation={UpdateRefundMutation}
        onCompleted={this.props.onCompleted}
      >
        {(updateRefund, { loading, error }) => (
          <Dialog
            title="Update Refund"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Amount">
                    <InputGroup
                      {...input('amount')}
                      rightElement={<Tag minimal={true}>ETH</Tag>}
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
                  text="Update Refund"
                  intent="primary"
                  loading={loading}
                  onClick={() => updateRefund(this.getVars())}
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
        offerID: String(this.props.offer.id),
        from: this.props.listing.seller.id,
        amount: web3.utils.toWei(this.state.amount, 'ether')
      }
    }
  }
}

export default UpdateRefund
