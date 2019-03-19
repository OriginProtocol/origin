import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button } from '@blueprintjs/core'

import { Dialog, FormGroup, InputGroup } from '@blueprintjs/core'

import { AcceptOfferMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class AcceptOffer extends Component {
  state = {
    message: ''
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    return (
      <Mutation
        mutation={AcceptOfferMutation}
        onCompleted={this.props.onCompleted}
      >
        {(acceptOffer, { loading, error }) => (
          <Dialog
            title="Accept Offer"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <FormGroup label="Message to Buyer">
                <InputGroup {...input('message')} />
              </FormGroup>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Accept Offer"
                  intent="primary"
                  loading={loading}
                  onClick={() => acceptOffer(this.getVars())}
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
        offerID: String(this.props.offer.id),
        from: this.props.listing.seller.id
      }
    }
  }
}

export default AcceptOffer
