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
  Checkbox,
  TextArea
} from '@blueprintjs/core'

import rnd from 'utils/rnd'
import withAccounts from 'hoc/withAccountsAndAllowance'
import withTokens from 'hoc/withTokens'

import { CreateListingMutation } from '../../../mutations'
import ErrorCallout from 'components/ErrorCallout'
import SelectAccount from 'components/SelectAccount'
import ImagePicker from 'components/ImagePicker'

export function showOGN(account) {
  if (!account.ogn) return ''
  if (!account.ogn.balance) return ''
  if (!account.ogn.allowance) return ''
  const balance = web3.utils.fromWei(String(account.ogn.balance), 'ether')
  const allowance = web3.utils.fromWei(String(account.ogn.allowance), 'ether')
  return ` (${balance} OGN available, ${allowance} allowed)`
}

class CreateListing extends Component {
  constructor(props) {
    super()

    let seller = rnd(props.accounts.filter(a => a.role === 'Seller'))
    if (props.metaMaskEnabled && props.metaMaskAccount) {
      seller = props.metaMaskAccount
    }
    const arbitrator = rnd(props.accounts.filter(a => a.role === 'Arbitrator'))

    this.state = {
      title: 'Cool Bike',
      currency: '0x0000000000000000000000000000000000000000',
      price: '0.1',
      depositManager: arbitrator ? arbitrator.id : '',
      from: seller ? seller.id : '',
      deposit: 5,
      category: 'For Sale',
      description: 'A very nice bike',
      autoApprove: true,
      media: [],
      unitsTotal: '1'
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })

    const currencyOpts = [
      {
        label: 'ETH',
        value: '0x0000000000000000000000000000000000000000'
      },
      ...this.props.tokens.map(token => ({
        label: token.symbol,
        value: token.id
      }))
    ]

    return (
      <Mutation
        mutation={CreateListingMutation}
        onCompleted={this.props.onCompleted}
      >
        {(createListing, { loading, error }) => (
          <Dialog
            title="Create Listing"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
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
                <div style={{ flex: 2, marginRight: 20 }}>
                  <FormGroup label="Title">
                    <InputGroup {...input('title')} />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FormGroup label="Units">
                    <InputGroup {...input('unitsTotal')} />
                  </FormGroup>
                </div>
              </div>
              <FormGroup>
                <TextArea
                  fill={true}
                  placeholder="Description (min 10 characters)"
                  {...input('description')}
                />
              </FormGroup>
              <FormGroup>
                <ImagePicker onChange={media => this.setState({ media })} />
              </FormGroup>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1.5, marginRight: 20 }}>
                  <FormGroup label="Price">
                    <ControlGroup fill={true}>
                      <InputGroup {...input('price')} />
                      <HTMLSelect
                        style={{ minWidth: 65 }}
                        {...input('currency')}
                        options={currencyOpts}
                      />
                    </ControlGroup>
                  </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: 30, padding: '0 5px' }}>
                  <FormGroup label="Deposit" labelInfo="(OGN)">
                    <Slider
                      fill={true}
                      min={0}
                      max={100}
                      stepSize={5}
                      labelStepSize={25}
                      onChange={deposit => this.setState({ deposit })}
                      value={this.state.deposit}
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
                <div style={{ flex: 2, marginRight: 20 }}>
                  <FormGroup label="Seller">
                    <SelectAccount {...input('from')} />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FormGroup label="Deposit Manager">
                    <HTMLSelect
                      fill={true}
                      {...input('depositManager')}
                      options={[
                        { label: 'Origin', value: web3.eth.defaultAccount }
                      ]}
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
                text="Create Listing"
                intent="primary"
                loading={loading}
                onClick={() => createListing(this.getVars())}
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
        deposit: String(this.state.deposit),
        depositManager: this.state.depositManager,
        from: this.state.from,
        autoApprove: this.state.autoApprove,
        data: {
          title: this.state.title,
          description: this.state.description,
          price: { currency: this.state.currency, amount: this.state.price },
          category: this.state.category,
          media: this.state.media,
          unitsTotal: Number(this.state.unitsTotal)
        }
      }
    }
  }
}

export default withTokens(withAccounts(CreateListing, 'marketplace'))
