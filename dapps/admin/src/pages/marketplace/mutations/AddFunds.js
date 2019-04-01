import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { Button, Dialog, FormGroup, InputGroup, Tag } from '@blueprintjs/core'

import { AddFundsMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class AddFunds extends Component {
  state = {
    amount: '0.1',
    reason: ''
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    return (
      <Mutation
        mutation={AddFundsMutation}
        onCompleted={this.props.onCompleted}
      >
        {(addFunds, { loading, error }) => (
          <Dialog
            title="Add Funds"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            refetchQueries={['AllAccounts']}
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
                  text="Add Funds"
                  intent="primary"
                  loading={loading}
                  onClick={() => addFunds(this.getVars())}
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
        listingID: String(this.props.listingId),
        offerID: String(this.props.offerId),
        from: this.props.offer.buyer.id,
        amount: web3.utils.toWei(this.state.amount, 'ether')
      }
    }
  }
}

export default AddFunds
