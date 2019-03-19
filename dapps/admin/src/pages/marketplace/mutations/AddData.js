import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import rnd from 'utils/rnd'

import { Button, Dialog, FormGroup, InputGroup } from '@blueprintjs/core'
import withAccounts from 'hoc/withAccounts'

import { AddDataMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'
import SelectAccount from 'components/SelectAccount'

class AddData extends Component {
  constructor(props) {
    super()

    const account = rnd(props.accounts)
    this.state = {
      data: '',
      from: account ? account.id : ''
    }
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

              <FormGroup label="From">
                <SelectAccount {...input('from')} />
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
      data: this.state.data,
      from: this.state.from
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

export default withAccounts(AddData, 'marketplace')
