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
      <Query query={query} variables={{ id }} pollInterval={3000}>
        {({ data, client }) => {
          const event = get(data, 'web3.transactionReceipt.events', []).find(
            e => e.event === this.props.event
          )

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
