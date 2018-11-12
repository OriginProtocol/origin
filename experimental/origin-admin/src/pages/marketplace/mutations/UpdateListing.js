import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button } from '@blueprintjs/core'

import {
  Dialog,
  FormGroup,
  InputGroup,
  ControlGroup,
  HTMLSelect,
  Slider,
  Checkbox
} from '@blueprintjs/core'

import withAccounts from 'hoc/withAccounts'

import { UpdateListingMutation } from '../../../mutations'
import ErrorCallout from 'components/ErrorCallout'

import { showOGN } from './CreateListing'

class UpdateListing extends Component {
  constructor(props) {
    super()

    this.state = {
      title: props.listing.title || '',
      currencyId: props.listing.price ? props.listing.price.currency : 'ETH',
      price: props.listing.price ? props.listing.price.amount : '0.1',
      from: props.listing.seller.id || '',
      additionalDeposit: 0,
      category: props.listing.category || 'For Sale',
      autoApprove: true
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    return (
      <Mutation
        mutation={UpdateListingMutation}
        onCompleted={this.props.onCompleted}
        lazy={true}
      >
        {(updateListing, { loading, error }) => (
          <Dialog
            title="Update Listing"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 3, marginRight: 20 }}>
                  <FormGroup label="Seller">
                    <HTMLSelect
                      {...input('from')}
                      fill={true}
                      options={this.props.accounts
                        .filter(a => a.role === 'Seller')
                        .map(a => ({
                          label: `${(a.name || a.id).substr(0, 24)} ${showOGN(
                            a
                          )}`,
                          value: a.id
                        }))}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FormGroup label="Auto-Approve">
                    <Checkbox
                      checked={this.state.autoApprove}
                      onChange={e =>
                        this.setState({ autoApprove: e.target.checked })
                      }
                    />
                  </FormGroup>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Category">
                    <HTMLSelect
                      fill={true}
                      {...input('category')}
                      options={[
                        'For Sale',
                        'Home Share',
                        'Car Share',
                        'Ticket'
                      ]}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 2 }}>
                  <FormGroup label="Title">
                    <InputGroup {...input('title')} />
                  </FormGroup>
                </div>
              </div>

              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Price">
                    <ControlGroup fill={true}>
                      <InputGroup {...input('price')} />
                      <HTMLSelect
                        style={{ minWidth: 65 }}
                        {...input('currencyId')}
                        options={['DAI', 'ETH', 'OGN']}
                      />
                    </ControlGroup>
                  </FormGroup>
                </div>
                <div style={{ flex: 1, padding: '0 5px' }}>
                  <FormGroup label="Additional Deposit" labelInfo="(OGN)">
                    <Slider
                      fill={true}
                      min={0}
                      max={100}
                      stepSize={5}
                      labelStepSize={25}
                      onChange={additionalDeposit =>
                        this.setState({ additionalDeposit })
                      }
                      value={this.state.additionalDeposit}
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
            <div
              className="bp3-dialog-footer"
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Button
                text="Update Listing"
                intent="primary"
                loading={loading}
                onClick={() => updateListing(this.getVars())}
              />
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
        additionalDeposit: String(this.state.additionalDeposit),
        from: this.state.from,
        autoApprove: this.state.autoApprove,
        data: {
          title: this.state.title,
          price: { amount: this.state.price, currency: this.state.currencyId },
          category: this.state.category
        }
      }
    }
  }
}

export default withAccounts(UpdateListing, 'marketplace')
