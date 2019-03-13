import React, { Component } from 'react'
import { withRouter } from 'react-router'

import { AnchorButton, Tooltip, Tag, Icon } from '@blueprintjs/core'

import Price from 'components/Price2'
import currency from 'utils/currency'
import withAccounts from 'hoc/withAccounts'

import {
  AcceptOffer,
  FinalizeOffer,
  DisputeOffer,
  WithdrawOffer,
  AddFunds,
  UpdateRefund,
  ExecuteRuling,
  MakeOffer,
  AddData
} from './mutations'

import AccountButton from '../accounts/AccountButton'

const Offers = ({ listing, offers, accounts }) => {
  if (!offers.length) return null
  return (
    <table className="bp3-html-table bp3-small mb-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Offer</th>
          <th>Qty</th>
          <th>Refund</th>
          <th>Buyer</th>
          <th>Commission</th>
          <th>Arbitrator</th>
          <th>Finalizes</th>
          <th
            style={{
              borderLeft: '1px solid rgba(16, 22, 26, 0.15)'
            }}
          >
            Buyer
          </th>
          <th>Seller</th>
          <th>Arb&apos;</th>
          <th>Other</th>
        </tr>
      </thead>
      <tbody>
        {offers.map(a => (
          <OfferRow
            key={a.id}
            offer={a}
            listing={listing}
            accounts={accounts}
          />
        ))}
      </tbody>
    </table>
  )
}

class OfferRow extends Component {
  state = {}

  render() {
    const { offer, listing } = this.props
    return (
      <>
        {this.renderActiveRow()}
        <AcceptOffer
          isOpen={this.state.acceptOffer}
          listing={listing}
          offer={offer}
          onCompleted={() => this.setState({ acceptOffer: false })}
        />

        <FinalizeOffer
          isOpen={this.state.finalizeOffer}
          listing={listing}
          offer={offer}
          onCompleted={() => this.setState({ finalizeOffer: false })}
        />

        <DisputeOffer
          isOpen={this.state.disputeOffer}
          listing={listing}
          offer={offer}
          party={this.state.disputeParty}
          onCompleted={() => this.setState({ disputeOffer: false })}
        />

        <WithdrawOffer
          isOpen={this.state.withdrawOffer}
          listing={listing}
          offer={offer}
          party={this.state.withdrawParty}
          onCompleted={() => this.setState({ withdrawOffer: false })}
        />

        <AddFunds
          isOpen={this.state.addFunds}
          listingId={listing.id}
          offerId={offer.id}
          offer={offer}
          onCompleted={() => this.setState({ addFunds: false })}
        />

        <UpdateRefund
          isOpen={this.state.updateRefund}
          listing={listing}
          offer={offer}
          onCompleted={() => this.setState({ updateRefund: false })}
        />

        <ExecuteRuling
          isOpen={this.state.executeRuling}
          listing={listing}
          offer={offer}
          onCompleted={() => this.setState({ executeRuling: false })}
        />

        <MakeOffer
          isOpen={this.state.updateOffer}
          listing={listing}
          offer={offer}
          onCompleted={() => this.setState({ updateOffer: false })}
        />

        <AddData
          isOpen={this.state.addData}
          listing={listing}
          offer={offer}
          onCompleted={() => this.setState({ addData: false })}
        />
      </>
    )
  }

  renderActiveRow() {
    const { offer, listing, accounts } = this.props

    const buyerPresent = accounts.find(
      a => offer.buyer && a.id === offer.buyer.id
    )
    const sellerPresent = accounts.find(
      a => listing.seller && a.id === listing.seller.id
    )
    const arbitratorPresent = accounts.find(
      a => offer.arbitrator && a.id === offer.arbitrator.id
    )
    let commission
    if (typeof offer.commission === 'string') {
      commission = { amount: offer.commission, currency: 'OGN' }
    } else if (typeof offer.commission === 'object') {
      commission = offer.commission
    }
    return (
      <tr className="vm">
        <td>{offer.offerId}</td>
        <td>{status(offer)}</td>
        <td>
          <Price price={offer.totalPrice} />
        </td>
        <td>{offer.quantity}</td>
        <td>{price(offer, 'refund')}</td>
        <td>
          <AccountButton account={offer.buyer} />
        </td>
        <td>
          {commission ? (
            <>
              {currency(commission)}
              <Icon
                style={{ verticalAlign: '-0.2rem', margin: '0 0.2rem' }}
                icon="arrow-right"
              />
              <AccountButton account={offer.affiliate} />
            </>
          ) : null}
        </td>
        <td>
          <AccountButton account={offer.arbitrator} />
        </td>
        <td>{offer.finalizes}</td>
        <td
          style={{
            borderLeft: '1px solid rgba(16, 22, 26, 0.15)'
          }}
        >
          {this.renderBuyerActions(offer, buyerPresent)}
        </td>
        <td>{this.renderSellerActions(offer, sellerPresent)}</td>
        <td>{this.renderArbitratorActions(offer, arbitratorPresent)}</td>
        <td>
          <Tooltip content="Add Data">
            <AnchorButton
              icon="comment"
              onClick={() => {
                this.setState({ addData: true })
              }}
            />
          </Tooltip>
        </td>
      </tr>
    )
  }

  renderBuyerActions(offer, buyerPresent) {
    if (offer.status === 1) {
      return (
        <>
          <Tooltip content="Update">
            <AnchorButton
              icon="edit"
              disabled={!buyerPresent}
              onClick={() => this.setState({ updateOffer: true })}
              style={{ marginRight: 5 }}
            />
          </Tooltip>
          <Tooltip content="Withdraw">
            <AnchorButton
              intent="danger"
              icon="trash"
              disabled={!buyerPresent}
              onClick={() =>
                this.setState({ withdrawOffer: true, withdrawParty: 'buyer' })
              }
            />
          </Tooltip>
        </>
      )
    }
    if (offer.status === 2) {
      return (
        <>
          <Tooltip content="Finalize">
            <AnchorButton
              intent="success"
              disabled={!buyerPresent}
              style={{ marginRight: 5, border: '1px solid black' }}
              icon="tick"
              onClick={() => this.setState({ finalizeOffer: true })}
            />
          </Tooltip>
          <Tooltip content="Add Funds">
            <AnchorButton
              style={{ marginRight: 5 }}
              disabled={!buyerPresent}
              icon="dollar"
              onClick={() => this.setState({ addFunds: true })}
            />
          </Tooltip>
          <Tooltip content="Dispute">
            <AnchorButton
              intent="danger"
              icon="issue"
              disabled={!buyerPresent}
              onClick={() =>
                this.setState({ disputeOffer: true, disputeParty: 'buyer' })
              }
            />
          </Tooltip>
        </>
      )
    }
  }

  renderSellerActions(offer, sellerPresent) {
    if (offer.status === 2) {
      return (
        <>
          <Tooltip content="Update Refund">
            <AnchorButton
              disabled={!sellerPresent}
              icon="dollar"
              onClick={() => this.setState({ updateRefund: true })}
              style={{ marginRight: 5 }}
            />
          </Tooltip>
          <Tooltip content="Dispute">
            <AnchorButton
              intent="danger"
              icon="issue"
              disabled={!sellerPresent}
              onClick={() =>
                this.setState({ disputeOffer: true, disputeParty: 'seller' })
              }
            />
          </Tooltip>
        </>
      )
    }
    if (offer.status === 1) {
      return (
        <>
          <Tooltip content="Accept">
            <AnchorButton
              intent="success"
              icon="tick"
              onClick={() => this.setState({ acceptOffer: true })}
              disabled={!sellerPresent}
              style={{ marginRight: 5, border: '1px solid black' }}
            />
          </Tooltip>
          <Tooltip content="Decline">
            <AnchorButton
              intent="danger"
              icon="cross"
              disabled={!sellerPresent}
              onClick={() =>
                this.setState({ withdrawOffer: true, withdrawParty: 'seller' })
              }
            />
          </Tooltip>
        </>
      )
    }
  }

  renderArbitratorActions(offer, arbitratorPresent) {
    if (offer.status === 3) {
      return (
        <>
          <Tooltip content="Execute Ruling">
            <AnchorButton
              disabled={!arbitratorPresent}
              icon="take-action"
              style={{ border: '1px solid black' }}
              onClick={() => this.setState({ executeRuling: true })}
            />
          </Tooltip>
        </>
      )
    }
  }
}

function price(offer, field = 'value') {
  const value = String(offer[field] || '0')
  if (offer.currency !== '0x0000000000000000000000000000000000000000') {
    return value
  } else {
    return web3.utils.fromWei(value, 'ether') + ' ETH'
  }
}

function status(offer) {
  if (!offer.valid) {
    return (
      <Tooltip content={offer.validationError}>
        <Tag icon="cross">Invalid</Tag>
      </Tooltip>
    )
  }

  if (offer.status === 0) {
    if (offer.withdrawnBy && offer.withdrawnBy.id !== offer.buyer.id) {
      return <Tag icon="cross">Declined</Tag>
    }
    return <Tag icon="trash">Withdrawn</Tag>
  }
  if (offer.status === 1) {
    return <Tag intent="warning">New</Tag>
  }
  if (offer.status === 2) {
    return (
      <Tag intent="primary" icon="tick">
        Accepted
      </Tag>
    )
  }
  if (offer.status === 3) {
    return <Tag intent="danger">Disputed</Tag>
  }
  if (offer.status === 4) {
    return (
      <Tag intent="success" icon="tick">
        Finalized
      </Tag>
    )
  }
  if (offer.status === 5) {
    return (
      <Tag intent="success" icon="tick">
        Dispute Resolved
      </Tag>
    )
  }
  return offer.status
}

export default withRouter(withAccounts(Offers, 'marketplace'))
