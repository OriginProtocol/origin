import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import TransactionsQuery from 'queries/Transactions'
import TransactionsSubscription from 'queries/TransactionsSubscription'

import Dropdown from 'components/Dropdown'

function subscribeToNewTransactions(subscribeToMore) {
  subscribeToMore({
    document: TransactionsSubscription,
    updateQuery: (prev, { transactionData }) => {
      if (!transactionData.data) return prev

      const newTransaction = transactionData.data.newTransaction
      return Object.assign({}, prev, {
        transactions: {
          ...prev.transactions,
          nodes: [newTransaction, ...prev.transactions],
        }
      })
    }
  })
}

class TransactionsNav extends Component {
  render() {
    return (
      <Query query={TransactionsQuery}>
        {({ subscribeToMore, ...result }) => {
          if (result.loading || result.error) return null
          if (!get(result, 'data.web3.metaMaskAccount.id')) {
            return null
          }

          return (
            <TransactionsDropdown
              {...this.props}
              {...result}
              subscribeToNewTransactions={() =>
                subscribeToNewTransactions(subscribeToMore)
              }
            />
          )
        }}
      </Query>
    )
  }
}

class TransactionsDropdown extends Component {
  componentDidMount() {
    this.props.subscribeToNewTransactions()
  }

  componentDidUpdate(prevProps) {
    const unread = get(this.props, 'data.notifications.totalUnread', 0),
      prevUnread = get(prevProps, 'data.notifications.totalUnread', 0)

    if (unread > prevUnread && !prevProps.open) {
      this.props.onOpen()
    }
  }

  render() {
    const { data, loading, error, open, onOpen, onClose } = this.props

    if (loading || error) return null
    if (!get(data, 'web3.transactions')) {
      return null
    }
    const hasUnread = data.web3.transactions.totalCount > 0 ? ' active' : ''

    return (
      <Dropdown
        el="li"
        className="nav-item confirmations"
        open={open}
        onClose={() => onClose()}
        content={<TransactionsContent {...data.web3.transactions} />}
      >
        <a
          className="nav-link"
          href="#"
          onClick={e => {
            e.preventDefault()
            open ? onClose() : onOpen()
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <div className={`confirmations-icon${hasUnread}`} />
        </a>
      </Dropdown>
    )
  }
}

const TransactionsContent = ({ totalCount = 0, nodes = [] }) => {
  const title = `Pending Blockchain Confirmation${totalCount === 1 ? '' : 's'}`
  return (
    <div className="dropdown-menu dropdown-menu-right show confirmations">
      <div className="count">
        <div className="total">{totalCount}</div>
        <div className="title">{title}</div>
      </div>
      {nodes.map(node => (
        <div key={node.id} className="confirmation">
          <div className="avatar" />
          <div className="detail">
            <div className="title">
              {node.title}
              <span>{node.timestamp}</span>
            </div>
            <div className="description">{node.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TransactionsNav

require('react-styl')(`
  @keyframes spin
    from
      transform: rotate(360deg)
    to
      transform: rotate(0deg)

  .navbar
    .nav-item
      .confirmations-icon
        width: 2.2rem
        height: 1.6rem
        background: url(images/nav/arrows-light.svg) no-repeat center
        background-size: contain
        position: relative
        &.active::after
          content: ""
          width: 16px
          height: 16px
          background: url(images/nav/blue-circle-arrows.svg) no-repeat
          background-position: -1px -1px
          background-size: 16px 16px
          border-radius: 10px
          border: 2px solid var(--dusk)
          position: absolute
          top: 11px
          right: 0px
          animation-name: spin
          animation-duration: 2s
          animation-iteration-count: infinite
          animation-timing-function: linear
      &.show
        .confirmations-icon
          background-image: url(images/nav/arrows-dark.svg)
        .active::after
          border-color: var(--white)

      .dropdown-menu.confirmations
        padding: 1rem
        width: 500px
        .count
          display: flex
          .title
            margin-left: 0.25rem

`)
