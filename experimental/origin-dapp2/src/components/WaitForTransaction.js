import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import Modal from 'components/Modal'
import TransactionReceiptQuery from 'queries/TransactionReceipt'

class WaitForTransaction extends Component {
  render() {
    if (this.props.hash === 'pending') {
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
        query={TransactionReceiptQuery}
        variables={{ id: this.props.hash }}
        pollInterval={3000}
      >
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

          return <Modal>{content}</Modal>
        }}
      </Query>
    )
  }
}

export default WaitForTransaction
