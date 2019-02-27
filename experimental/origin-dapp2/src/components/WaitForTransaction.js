import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import Modal from 'components/Modal'
import MobileLinkerCode from 'components/MobileLinkerCode'
import query from 'queries/TransactionReceipt'

// Returns the role of an Ethereum event, which is used by the web site to
// render the correct call-to-action for downloading the mobile wallet.
function roleForEvent(e) {
  if (!e) return ''
  if (e.startsWith('Listing')) return 'seller'
  if (e.startsWith('Offer')) return 'buyer'
  if (e.startsWith('Identity')) return ''
}

class WaitForTransaction extends Component {
  render() {
    const id = this.props.hash
    const role = roleForEvent(this.props.event)
    if (id === 'pending') {
      const walletType = this.props.walletType
      const provider =
        walletType && walletType.startsWith('mobile-')
          ? 'mobile wallet'
          : 'MetaMask'
      return (
        <>
          <MobileLinkerCode role={role} />
          <Modal
            onClose={() => {
              if (this.props.onClose) {
                this.props.onClose()
              }
            }}
          >
            <div className="make-offer-modal">
              <div className="spinner light" />
              <div>
                <b>Confirm Transaction</b>
              </div>
              <div>Please confirm this transaction in {provider}</div>
            </div>
          </Modal>
        </>
      )
    }

    return (
      <Query query={query} variables={{ id }} pollInterval={3000}>
        {({ data, client, error }) => {
          const events = get(data, 'web3.transactionReceipt.events', [])
          const currentBlock = get(data, 'web3.blockNumber')
          const confirmedBlock = get(
            data,
            'web3.transactionReceipt.blockNumber'
          )
          const event =
            events.find(e => e.event === this.props.event) || events[0]

          let content
          if (error) {
            console.log(error)
            content = (
              <div className="make-offer-modal">
                <div className="spinner light" />
                <div>
                  <b>Error - see console</b>
                </div>
              </div>
            )
          } else if (!event) {
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
