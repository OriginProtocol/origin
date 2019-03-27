import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import query from 'queries/UserTransactions'
import distanceToNow from 'utils/distanceToNow'

import withWallet from 'hoc/withWallet'

import Dropdown from 'components/Dropdown'
import Segments from 'components/Segments'
import TransactionDescription from 'components/TransactionDescription'

class TransactionsNav extends Component {
  render() {
    return (
      <Query
        query={query}
        pollInterval={3000}
        variables={{ first: 5, id: this.props.wallet }}
        skip={!this.props.wallet}
      >
        {({ loading, error, data }) => {
          if (loading || error) return null

          const blockNumber = get(data, 'web3.blockNumber', 0)
          const allNodes = get(data, 'marketplace.user.transactions.nodes', [])
          const pendingNodes = allNodes.filter(
            n => blockNumber - n.blockNumber <= 6
          )
          const pending = pendingNodes.length > 0

          return (
            <Dropdown
              el="li"
              className="nav-item confirmations d-none d-md-flex"
              open={this.props.open}
              onClose={() => this.props.onClose()}
              content={
                <TransactionsContent
                  nodes={allNodes}
                  blockNumber={blockNumber}
                  pending={pendingNodes.length}
                />
              }
            >
              <a
                className="nav-link"
                href="#"
                onClick={e => {
                  e.preventDefault()
                  this.props.open ? this.props.onClose() : this.props.onOpen()
                }}
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <div
                  className={`confirmations-icon${pending ? ' active' : ''}`}
                />
              </a>
            </Dropdown>
          )
        }}
      </Query>
    )
  }
}

const TransactionsContent = ({ pending, nodes, blockNumber }) => {
  const title = fbt(
    'Pending Blockchain ' + fbt.plural('Confirmation', pending),
    'Navigation.confirmations.pendingTransactions'
  )

  return (
    <div className="dropdown-menu dropdown-menu-right show confirmations">
      <div className="count">
        <div className="total">{pending}</div>
        <div className="title">{title}</div>
      </div>
      {nodes.map(node => {
        const confirmations = blockNumber - node.blockNumber
        return (
          <div key={node.id} className="confirmation">
            <div>
              <div>
                <div className="title">
                  <TransactionDescription receipt={node.receipt} />
                </div>
                <div className="time">{distanceToNow(node.submittedAt)}</div>
              </div>
              <div>
                <div className="parties">{`Tx: ${node.id}`}</div>
                <div className="confirmations">
                  {confirmations <= 6
                    ? fbt(
                        `${fbt.param(
                          'confirmations.noOfConfirmations',
                          confirmations
                        )} of 6 confirmations`,
                        'confirmations.underLimit'
                      )
                    : fbt(
                        `Complete (${fbt.param(
                          'confirmations.noOfConfirmations',
                          confirmations
                        )} confirmations)`,
                        'confirmations.atLimit'
                      )}
                </div>
              </div>
            </div>
            {confirmations > 6 ? (
              <div className="complete" />
            ) : (
              <Segments
                size={40}
                filled={confirmations <= 6 ? confirmations : 6}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default withWallet(TransactionsNav)

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
          background-position: center
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
        max-width: 500px
        background-color: var(--pale-grey-three)
        .count
          display: flex
          padding: 1rem
          box-shadow: 0 1px 0 0 #c2cbd3;
          background: var(--white)
          font-size: 18px
          color: #000
          font-weight: bold;
          border-radius: var(--default-radius) 0 0 0
          white-space: nowrap
          .total
            background: var(--clear-blue)
            border-radius: 1rem
            color: var(--white)
            padding: 0 0.5rem
          .title
            margin-left: 0.5rem
        .confirmation
          padding: 1rem 1rem 0 1rem
          align-items: center
          &:last-child
            padding-bottom: 1rem
          display: flex
          font-size: 16px
          .complete
            width: 2rem
            height: 2rem
            border-radius: 1rem
            background: var(--greenblue) url(images/checkmark.svg) center no-repeat
          .time,.confirmations
            font-size: 12px
            color: var(--bluey-grey)
          .parties
            white-space: nowrap
            font-size: 12px
            color: var(--steel)
            overflow: hidden
            margin-right: 1rem
            text-overflow: ellipsis
          > div:nth-child(1)
            flex: 1
            min-width: 0
            > div
              display: flex
              flex: 1
              margin-right: 1rem
              align-items: flex-end
              > div:nth-child(1)
                flex: 1
            > div:nth-child(2)
              margin-top: 0.125rem

`)
