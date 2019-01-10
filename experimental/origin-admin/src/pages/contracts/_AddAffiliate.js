import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button } from '@blueprintjs/core'

import { Dialog, FormGroup, InputGroup } from '@blueprintjs/core'

import { AddAffiliateMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class AddAffiliate extends Component {
  state = { affiliate: '' }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    return (
      <Mutation
        mutation={AddAffiliateMutation}
        onCompleted={this.props.onCompleted}
      >
        {(addAffiliate, { loading, error }) => (
          <Dialog
            title="Add Affiliate"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <FormGroup label="Affiliate">
                <InputGroup {...input('affiliate')} />
              </FormGroup>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Add Affiliate"
                  intent="primary"
                  loading={loading}
                  onClick={() => addAffiliate(this.getVars())}
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
        affiliate: this.state.affiliate,
        from: this.props.from
      }
    }
  }
}

export default AddAffiliate
