import React, { Component } from 'react'
import gql from 'graphql-tag'
import gqlClient from '@origin/graphql'

import { ProgressBar } from '@blueprintjs/core'
import { RefetchMutation } from 'queries/Mutations'
import Toaster from './Toaster'

const TransactionSubscription = gql`
  subscription onTransactionUpdated {
    transactionUpdated {
      id
      status
      mutation
      confirmations
    }
  }
`

const refetchQueries = {
  sendFromWallet: ['AllAccounts'],
  deployToken: ['AllContracts'],
  createListing: ['AllAccounts', 'AccountsWithAllowance', 'AllListings'],
  updateListing: [
    'AllAccounts',
    'AccountsWithAllowance',
    'AllListings',
    'Listing'
  ],
  makeOffer: ['AllAccounts', 'Listing'],
  acceptOffer: ['AllAccounts', 'Listing'],
  finalizeOffer: ['AllAccounts', 'Listing'],
  withdrawOffer: ['AllAccounts', 'Listing'],
  withdrawListing: ['Listing'],
  addFunds: ['AllAccounts', 'Listing'],
  updateRefund: ['AllAccounts', 'Listing'],
  disputeOffer: ['AllAccounts', 'Listing'],
  executeRuling: ['AllAccounts', 'Listing'],
  addData: ['AllAccounts', 'Listing'],
  createWallet: ['AllAccounts'],
  sendFromNode: ['AllAccounts'],
  deployMarketplace: ['AllAccounts'],
  transferToken: ['AllAccounts', 'AccountTokenBalance'],
  deployIdentity: ['AllAccounts', 'Identities']
}

const mutationNames = {
  sendFromWallet: 'Send Eth',
  deployToken: 'Deploy Token',
  createListing: 'Create Listing',
  updateListing: 'Update Listing',
  makeOffer: 'Make Offer',
  acceptOffer: 'Accept Offer',
  finalizeOffer: 'Finalize Offer',
  withdrawOffer: 'Withdraw Offer',
  withdrawListing: 'Withdraw Listing',
  addFunds: 'Add Funds',
  updateRefund: 'Update Refund',
  disputeOffer: 'Start Dispute',
  executeRuling: 'Execute Ruling',
  addData: 'Add Data',
  createWallet: 'Create Wallet',
  sendFromNode: 'Send Eth from Node',
  deployMarketplace: 'Deploy Marketplace',
  transferToken: 'Transfer Token',
  addAffiliate: 'Add Affiliate'
}

const statuses = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  receipt: 'Pending',
  error: 'Error'
}

class TimedProgressBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pct: 0,
      startTime: +new Date(),
      duration: (props.duration || 10) * 1000
    }
  }

  componentDidMount() {
    const update = () => {
      const pct =
        Math.round(
          ((+new Date() - this.state.startTime) / this.state.duration) * 100
        ) / 100
      this.setState({ pct })
      if (pct < 1) {
        this.af = requestAnimationFrame(update)
      }
    }
    this.af = requestAnimationFrame(update)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.af)
  }

  render() {
    let stripes = true,
      intent = 'primary',
      value = this.state.pct

    if (this.props.status === 'confirmed') {
      stripes = false
      intent = 'success'
      value = 1
    } else if (this.props.status === 'error') {
      stripes = false
      intent = 'danger'
      value = 1
    }
    return <ProgressBar stripes={stripes} intent={intent} value={value} />
  }
}

class TransactionToasts extends Component {
  constructor() {
    super()
    this.state = {
      pct: 0,
      startTime: +new Date(),
      endTime: +new Date() + 1000 * 10,
      diff: 10 * 1000
    }
  }
  componentDidMount() {
    this.transactions = {}
    this.hide = {}
    gqlClient.subscribe({ query: TransactionSubscription }).subscribe({
      next: async result => {
        try {
          const t = result.data.transactionUpdated
          if (
            t.status === 'confirmed' &&
            t.confirmations === 1 &&
            refetchQueries[t.mutation]
          ) {
            gqlClient.mutate({
              mutation: RefetchMutation,
              refetchQueries: refetchQueries[t.mutation]
            })
          }

          if (this.hide[t.id] === true) return
          const config = {
            icon: 'time',
            message: this.renderProgress(t),
            timeout: 0,
            onDismiss: () => (this.hide[t.id] = true)
          }
          if (t.status === 'confirmed') {
            config.timeout = 3000
            config.icon = 'tick'
          } else if (t.status === 'error') {
            config.icon = 'cross'
          }
          this.transactions[t.id] = Toaster.show(
            config,
            this.transactions[t.id]
          )
        } catch (e) {
          /* Ignore */
        }
      }
    })
  }

  render() {
    return null
  }

  renderProgress(transaction) {
    const status = statuses[transaction.status] || transaction.status
    const name = mutationNames[transaction.mutation] || transaction.mutation
    return (
      <div>
        <div className="mb-2">{`${name}: ${status}`}</div>
        <TimedProgressBar status={transaction.status} />
      </div>
    )
  }
}

export default TransactionToasts
