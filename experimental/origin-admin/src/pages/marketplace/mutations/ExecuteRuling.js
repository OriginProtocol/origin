import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button } from '@blueprintjs/core'

import {
  Dialog,
  FormGroup,
  InputGroup,
  HTMLSelect,
  Tag
} from '@blueprintjs/core'

import { ExecuteRulingMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class ExecuteRuling extends Component {
  state = {
    message: '',
    ruling: 'pay-seller',
    commission: 'pay',
    refund: '0'
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    return (
      <Mutation
        mutation={ExecuteRulingMutation}
        onCompleted={this.props.onCompleted}
      >
        {(executeRuling, { loading, error }) => (
          <Dialog
            title="Execute Ruling"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Ruling">
                    <HTMLSelect
                      fill={true}
                      {...input('ruling')}
                      options={[
                        { label: 'Pay Seller', value: 'pay-seller' },
                        { label: 'Partial Refund', value: 'partial-refund' },
                        { label: 'Refund Buyer', value: 'refund-buyer' }
                      ]}
                    />
                  </FormGroup>
                </div>
                {this.state.ruling !== 'partial-refund' ? null : (
                  <div style={{ flex: 1, marginRight: 20 }}>
                    <FormGroup label="Refund">
                      <InputGroup
                        {...input('refund')}
                        rightElement={<Tag minimal={true}>ETH</Tag>}
                      />
                    </FormGroup>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <FormGroup label="Commission">
                    <HTMLSelect
                      fill={true}
                      {...input('commission')}
                      options={[
                        { label: 'Pay to Affiliate', value: 'pay' },
                        { label: 'Refund to Seller', value: 'refund' }
                      ]}
                    />
                  </FormGroup>
                </div>
              </div>
              <FormGroup label="Message">
                <InputGroup {...input('message')} />
              </FormGroup>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Execute Ruling"
                  intent="primary"
                  loading={loading}
                  onClick={() => executeRuling(this.getVars())}
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
        message: this.state.message,
        ruling: this.state.ruling,
        commission: this.state.commission,
        refund: web3.utils.toWei(this.state.refund, 'ether'),
        from: this.props.offer.arbitrator.id
      }
    }
  }
}

export default ExecuteRuling
