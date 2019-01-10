import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { Button, Dialog, FormGroup, InputGroup } from '@blueprintjs/core'

import { DisputeOfferMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class DisputeOffer extends Component {
  state = {
    reason: ''
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })

    return (
      <Mutation
        mutation={DisputeOfferMutation}
        onCompleted={this.props.onCompleted}
      >
        {(disputeOffer, { loading, error }) => (
          <Dialog
            title="Dispute Offer"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <FormGroup label="Reason">
                <InputGroup {...input('reason')} />
              </FormGroup>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Dispute Offer"
                  intent="primary"
                  loading={loading}
                  onClick={() => disputeOffer(this.getVars())}
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

export default DisputeOffer
