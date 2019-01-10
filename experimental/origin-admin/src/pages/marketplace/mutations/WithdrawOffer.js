import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { Button, Dialog, FormGroup, InputGroup } from '@blueprintjs/core'

import { WithdrawOfferMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class WithdrawOffer extends Component {
  state = {
    message: ''
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    const title = this.props.party === 'seller' ? 'Decline' : 'Withdraw'

    return (
      <Mutation
        mutation={WithdrawOfferMutation}
        onCompleted={this.props.onCompleted}
      >
        {(withdrawOffer, { loading, error }) => (
          <Dialog
            title={`${title} Offer`}
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <FormGroup label="Reason">
                <InputGroup {...input('message')} />
              </FormGroup>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text={`${title} Offer`}
                  intent="primary"
                  loading={loading}
                  onClick={() => withdrawOffer(this.getVars())}
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }

  getVars() {
    const from =
      this.props.party === 'seller'
        ? this.props.listing.seller.id
        : this.props.offer.buyer.id
    return {
      variables: {
        listingID: String(this.props.listing.id),
        offerID: String(this.props.offer.id),
        from
      }
    }
  }
}

export default WithdrawOffer
