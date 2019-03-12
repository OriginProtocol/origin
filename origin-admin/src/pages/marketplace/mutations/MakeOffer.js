import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import get from 'lodash/get'
import { Button } from '@blueprintjs/core'
import { DateInput } from '@blueprintjs/datetime'

import {
  Dialog,
  FormGroup,
  InputGroup,
  HTMLSelect,
  Tag,
  ControlGroup
} from '@blueprintjs/core'

import rnd from 'utils/rnd'
import withAccounts from 'hoc/withAccounts'
import withCurrencies from 'hoc/withCurrencies'
import { MakeOfferMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'
const ZeroAddress = '0x0000000000000000000000000000000000000000'

const jsDateFormatter = {
  formatDate: date => date.toLocaleDateString(),
  parseDate: str => new Date(str),
  placeholder: 'M/D/YYYY'
}

class MakeOffer extends Component {
  constructor(props) {
    super()

    const buyer = rnd(props.accounts.filter(a => a.role === 'Buyer'))
    const arbitrator = rnd(props.accounts.filter(a => a.role === 'Arbitrator'))
    const affiliate = rnd(props.accounts.filter(a => a.role === 'Affiliate'))

    this.state = {
      finalizes: new Date(+new Date() + 1000 * 60 * 60 * 24 * 3),
      affiliate: affiliate ? affiliate.id : ZeroAddress,
      commission: '5',
      value: '0.1',
      quantity: 1,
      currency: get(props, 'listing.acceptedTokens.0.id', 'token-ETH'),
      arbitrator: arbitrator ? arbitrator.id : '',
      from: buyer ? buyer.id : ''
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    const title = this.props.offer ? 'Update Offer' : 'Make Offer'
    const affiliates = this.props.accounts
      .filter(a => a.role === 'Affiliate')
      .map(a => ({
        label: `${(a.name || a.id).substr(0, 24)}`,
        value: a.id
      }))
    affiliates.push({ label: 'None', value: ZeroAddress })

    const acceptedTokens = this.props.listing.acceptedTokens || []
    const currencyOpts = this.props.currencies
      .filter(currency => acceptedTokens.some(t => t.id === currency.id))
      .map(currency => ({
        label: currency.code,
        value: currency.id
      }))

    return (
      <Mutation
        mutation={MakeOfferMutation}
        onCompleted={this.props.onCompleted}
      >
        {(makeOffer, { loading, error }) => (
          <Dialog
            title={title}
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            lazy={true}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Amount">
                    <ControlGroup fill={true}>
                      <InputGroup {...input('value')} />
                      <HTMLSelect
                        style={{ minWidth: 65 }}
                        {...input('currency')}
                        options={currencyOpts}
                      />
                    </ControlGroup>
                  </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Quantity">
                    <InputGroup {...input('quantity')} />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FormGroup label="Finalizes">
                    <DateInput
                      value={this.state.finalizes}
                      onChange={finalizes => this.setState({ finalizes })}
                      {...jsDateFormatter}
                      minDate={new Date()}
                      maxDate={new Date(2023, 0)}
                      timePrecision="minute"
                      timePickerProps={{
                        useAmPm: true,
                        value: this.state.finalizes,
                        onChange: finalizes => this.setState({ finalizes })
                      }}
                    />
                  </FormGroup>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Buyer">
                    <HTMLSelect
                      fill={true}
                      {...input('from')}
                      options={this.props.accounts
                        .filter(a => a.role === 'Buyer')
                        .map(a => ({
                          label: `${(a.name || a.id).substr(0, 24)}`,
                          value: a.id
                        }))}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Affiliate">
                    <HTMLSelect
                      fill={true}
                      {...input('affiliate')}
                      options={affiliates}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Arbitrator">
                    <HTMLSelect
                      fill={true}
                      {...input('arbitrator')}
                      options={[
                        { label: 'Origin', value: web3.eth.defaultAccount }
                      ]}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FormGroup label="Commission">
                    {this.state.affiliate === ZeroAddress ? (
                      <InputGroup
                        disabled={true}
                        value="0"
                        rightElement={<Tag minimal={true}>OGN</Tag>}
                      />
                    ) : (
                      <InputGroup
                        disabled={this.state.affiliate === ZeroAddress}
                        {...input('commission')}
                        rightElement={<Tag minimal={true}>OGN</Tag>}
                      />
                    )}
                  </FormGroup>
                </div>
              </div>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text={title}
                  intent="primary"
                  loading={loading}
                  onClick={() => makeOffer(this.getVars())}
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }

  getVars() {
    const { affiliate } = this.state
    const commission =
      affiliate === ZeroAddress
        ? '0'
        : web3.utils.toWei(this.state.commission, 'ether')
    const variables = {
      listingID: String(this.props.listing.id),
      from: this.state.from,
      finalizes: Math.floor(Number(this.state.finalizes) / 1000),
      affiliate,
      commission,
      value: this.state.value,
      currency: this.state.currency,
      arbitrator: this.state.arbitrator,
      quantity: Number(this.state.quantity)
    }
    if (this.props.offer) {
      variables.withdraw = String(this.props.offer.id)
    }
    return { variables }
  }
}

export default withCurrencies(withAccounts(MakeOffer, 'marketplace'))
