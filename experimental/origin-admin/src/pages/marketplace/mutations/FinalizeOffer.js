import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { Button, Dialog, FormGroup, InputGroup } from '@blueprintjs/core'

import { FinalizeOfferMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class FinalizeOffer extends Component {
  state = {
    review: ''
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })

    return (
      <Mutation
        mutation={FinalizeOfferMutation}
        onCompleted={this.props.onCompleted}
      >
        {(finalizeOffer, { loading, error }) => (
          <Dialog
            title="Finalize Offer"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <FormGroup label="Review">
                <InputGroup {...input('review')} />
              </FormGroup>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Finalize Offer"
                  intent="primary"
                  loading={loading}
                  onClick={() => finalizeOffer(this.getVars())}
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
        from: this.props.offer.buyer.id
      }
    }
  }
}

export default FinalizeOffer
