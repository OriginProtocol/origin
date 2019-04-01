import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import pick from 'lodash/pick'
import get from 'lodash/get'
import Categories from '@origin/graphql/src/constants/Categories'

import {
  Button,
  Dialog,
  FormGroup,
  InputGroup,
  ControlGroup,
  HTMLSelect,
  Slider,
  Checkbox,
  TextArea,
  Tag
} from '@blueprintjs/core'

import rnd from 'utils/rnd'
import withAccounts from 'hoc/withAccountsAndAllowance'
import withTokens from 'hoc/withTokens'

import demoListings from './_demoListings'
import { CreateListingMutation, UpdateListingMutation } from 'queries/Mutations'

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
    if (props.useMetaMask && props.metaMaskAccount) {
      seller = props.metaMaskAccount
    }
    const arbitrator = rnd(props.accounts.filter(a => a.role === 'Arbitrator'))

    if (props.listing && props.listing.id) {
      const media = props.listing.media || []
      const category = props.listing.category || 'schema.forSale'
      const subCategory = get(Categories[category], `0.0`, '')
      const commissionPerUnit = props.listing.commissionPerUnit
        ? web3.utils.fromWei(props.listing.commissionPerUnit, 'ether')
        : '0'

      this.state = {
        title: props.listing.title || '',
        currency: props.listing.price ? props.listing.price.currency : 'ETH',
        price: props.listing.price ? props.listing.price.amount : '0.1',
        from: seller ? seller.id : '',
        deposit: 0,
        category,
        subCategory,
        description: props.listing.description || '',
        autoApprove: true,
        media,
        initialMedia: media,
        unitsTotal: props.listing.unitsTotal,
        commissionPerUnit
      }
    } else {
      this.state = {
        title: '',
        currency: 'ETH',
        price: '0.1',
        depositManager: arbitrator ? arbitrator.id : '',
        from: seller ? seller.id : '',
        deposit: 5,
        category: 'schema.forSale',
        subCategory: get(Categories['schema.forSale'], `0.0`, ''),
        description: '',
        autoApprove: true,
        media: [],
        initialMedia: [],
        unitsTotal: 1,
        commissionPerUnit: 5
      }
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
        value: 'ETH'
      },
      ...this.props.tokens.map(token => ({
        label: token.symbol,
        value: token.symbol
      }))
    ]

    const isCreate = this.props.listing && this.props.listing.id ? false : true

    return (
      <Mutation
        mutation={isCreate ? CreateListingMutation : UpdateListingMutation}
        onCompleted={this.props.onCompleted}
      >
        {(upsertListing, { loading, error }) => (
          <Dialog
            title={`${isCreate ? 'Create' : 'Update'} Listing`}
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div className="mb-3">
                <Button
                  small="true"
                  text="Empty"
                  onClick={() => this.setDemoListing(-1)}
                />
                <Button
                  small="true"
                  text="House 1"
                  className="ml-2"
                  onClick={() => this.setDemoListing(0)}
                />
                <Button
                  small="true"
                  text="House 2"
                  className="ml-2"
                  onClick={() => this.setDemoListing(1)}
                />
                <Button
                  small="true"
                  text="House 3"
                  className="ml-2"
                  onClick={() => this.setDemoListing(2)}
                />
                <Button
                  small="true"
                  text="Car"
                  className="ml-2"
                  onClick={() => this.setDemoListing(3)}
                />
                <Button
                  small="true"
                  text="Tickets"
                  className="ml-2"
                  onClick={() => this.setDemoListing(4)}
                />
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Category">
                    <HTMLSelect
                      fill={true}
                      {...input('category')}
                      options={Categories.root.map(c => ({
                        label: c[1],
                        value: c[0]
                      }))}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 2 }}>
                  <FormGroup label="Sub-Category">
                    <HTMLSelect
                      fill={true}
                      {...input('subCategory')}
                      options={(Categories[this.state.category] || []).map(
                        c => ({
                          label: c[1],
                          value: c[0]
                        })
                      )}
                    />
                  </FormGroup>
                </div>
              </div>
              <FormGroup>
                <InputGroup {...input('title')} placeholder="Title" />
              </FormGroup>
              <FormGroup>
                <TextArea
                  fill={true}
                  placeholder="Description (min 10 characters)"
                  {...input('description')}
                />
              </FormGroup>
              <FormGroup>
                <ImagePicker
                  media={this.state.initialMedia}
                  onChange={media => this.setState({ media })}
                />
              </FormGroup>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
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
                <div style={{ flex: 1 }}>
                  <FormGroup label="Units">
                    <InputGroup {...input('unitsTotal')} />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex' }}>
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
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Com/Unit">
                    <InputGroup
                      {...input('commissionPerUnit')}
                      rightElement={<Tag minimal={true}>OGN</Tag>}
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
              {!isCreate ? null : (
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
              )}
            </div>
            <div
              className="bp3-dialog-footer"
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Button
                text={`${isCreate ? 'Create' : 'Update'} Listing`}
                intent="primary"
                loading={loading}
                onClick={() =>
                  upsertListing(
                    isCreate ? this.getCreateVars() : this.getUpdateVars()
                  )
                }
              />
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }

  setDemoListing(idx) {
    if (idx === -1) {
      this.setState({
        title: '',
        price: '',
        category: '',
        subCategory: '',
        description: '',
        media: [],
        initialMedia: [],
        unitsTotal: 1
      })
      return
    }
    const egListing = demoListings[idx]
    this.setState({
      title: egListing.title,
      price: egListing.price.amount,
      category: egListing.category,
      subCategory: egListing.subCategory,
      description: egListing.description,
      media: egListing.media,
      initialMedia: egListing.media,
      unitsTotal: egListing.unitsTotal,
      commission: egListing.commission || '2',
      commissionPerUnit: egListing.commissionPerUnit || '2'
    })
  }

  getCreateVars() {
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
          subCategory: this.state.subCategory,
          media: this.state.media
        },
        unitData: {
          unitsTotal: Number(this.state.unitsTotal)
        }
      }
    }
  }

  getUpdateVars() {
    return {
      variables: {
        listingID: String(this.props.listing.id),
        additionalDeposit: String(this.state.deposit),
        from: this.state.from,
        autoApprove: this.state.autoApprove,
        data: {
          title: this.state.title,
          description: this.state.description,
          price: { currency: this.state.currency, amount: this.state.price },
          category: this.state.category,
          subCategory: this.state.subCategory,
          media: this.state.media.map(m => pick(m, 'contentType', 'url')),
          unitsTotal: Number(this.state.unitsTotal),
          commission: String(this.state.deposit) || '0',
          commissionPerUnit: String(this.state.commissionPerUnit) || '0'
        }
      }
    }
  }
}

export default withTokens(withAccounts(CreateListing, 'marketplace'))
