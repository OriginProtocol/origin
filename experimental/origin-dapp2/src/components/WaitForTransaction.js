import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import Modal from 'components/Modal'
import query from 'queries/TransactionReceipt'

class WaitForTransaction extends Component {
  render() {
    const id = this.props.hash
    if (id === 'pending') {
      return (
        <Modal>
          <div className="make-offer-modal">
            <div className="spinner light" />
            <div>
              <b>Confirm Transaction</b>
            </div>
            <div>Please accept or confirm this transaction in MetaMask</div>
          </div>
        </Modal>
      )
    }

    return (
      <Query
        query={query}
        variables={{ id }}
        pollInterval={3000}
        fetchPolicy="network-only"
      >
        {({ data, client }) => {
          const events = get(data, 'web3.transactionReceipt.events', [])
          const currentBlock = get(data, 'web3.blockNumber')
          const confirmedBlock = get(
            data,
            'web3.transactionReceipt.blockNumber'
          )
          const event =
            events.find(e => e.event === this.props.event) || events[0]

          let content
          if (!event) {
            content = (
              <div className="make-offer-modal">
                <div className="spinner light" />
                <div>
                  <b>Mining...</b>
                </div>
              </div>
            )
          } else if (currentBlock <= confirmedBlock) {
            content = (
              <div className="make-offer-modal">
                <div className="spinner light" />
                <div>
                  <b>Waiting for confirmation...</b>
                </div>
              </div>
            )
          } else {
            content = this.props.children({ event, client })
          }

          return (
            <Modal
              shouldClose={this.props.onClose ? this.props.shouldClose : false}
              onClose={() => {
                if (this.props.onClose) {
                  this.props.onClose()
                }
              }}
              children={content}
            />
          )
        }}
      </Query>
    )
  }
}

export default WaitForTransaction
