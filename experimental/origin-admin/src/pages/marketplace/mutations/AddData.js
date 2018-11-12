import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import { Button, Dialog, FormGroup, InputGroup } from '@blueprintjs/core'

import { AddDataMutation } from '../../../mutations'
import ErrorCallout from 'components/ErrorCallout'

class AddData extends Component {
  state = {
    data: ''
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    let title = 'Add Data'
    if (this.props.offer) {
      title += ' to Offer'
    } else if (this.props.listing) {
      title += ' to Listing'
    }

    return (
      <Mutation mutation={AddDataMutation} onCompleted={this.props.onCompleted}>
        {(addData, { loading, error }) => (
          <Dialog
            title={title}
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <FormGroup label="Data">
                <InputGroup {...input('data')} />
              </FormGroup>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Add Data"
                  intent="primary"
                  loading={loading}
                  onClick={() => addData(this.getVars())}
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }

  getVars() {
    const variables = {
      data: this.state.data
    }
    if (this.props.listing) {
      variables.listingID = String(this.props.listing.id)
    }
    if (this.props.offer) {
      variables.offerID = String(this.props.offer.id)
    }
    return { variables }
  }
}

export default AddData
