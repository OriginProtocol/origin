import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
import MobileLinkerCode from 'components/MobileLinkerCode'
import MetaMaskAnimation from 'components/MetaMaskAnimation'
import query from 'queries/TransactionReceipt'
import withWallet from 'hoc/withWallet'

// Returns the role of an Ethereum event, which is used by the web site to
// render the correct call-to-action for downloading the mobile wallet.
function roleForEvent(e) {
  if (!e) return ''
  if (e.startsWith('Listing')) return 'seller'
  if (e.startsWith('Offer')) return 'buyer'
  if (e.startsWith('Identity')) return ''
}

const WaitForFirstBlock = () => (
  <div className="make-offer-modal">
    <div className="spinner light" />
    <div>
      <b>
        <fbt desc="WaitForTransaction.writingToBlockchain">
          Writing to the blockchain.
        </fbt>
        <br />
        <fbt desc="WaitForTransaction.mayTakeSomeTime">
          This might take a minute.
        </fbt>
      </b>
    </div>
  </div>
)

const WaitForConfirmation = () => (
  <div className="make-offer-modal">
    <div className="spinner light" />
    <div>
      <b>
        <fbt desc="WaitForTransaction.waitingForConfirmation">
          Waiting for confirmation.
        </fbt>
        <br />
        <fbt desc="WaitForTransaction.mayTakeSomeTime">
          This might take a minute.
        </fbt>
      </b>
    </div>
  </div>
)

const Error = () => (
  <div className="make-offer-modal">
    <div className="error-icon" />
    <div>
      <b>
        <fbt desc="WaitForTransaction.errorSeeConsole">Error - see console</fbt>
      </b>
    </div>
  </div>
)

const Confirm = () => (
  <>
    <div className="spinner light" />
    <div>
      <b>
        <fbt desc="WaitForTransaction.confirm">Confirm Transaction</fbt>
      </b>
    </div>
  </>
)

class WaitForTransaction extends Component {
  state = {}
  render() {
    const id = this.props.hash
    const role = roleForEvent(this.props.event)
    if (id === 'pending') {
      const walletType = this.props.walletType
      const provider =
        walletType && walletType.startsWith('mobile-')
          ? 'mobile wallet'
          : walletType

      const content = (
        <div className="make-offer-modal">
          {provider === 'MetaMask' ? <MetaMaskAnimation /> : <Confirm />}
          <div>
            <fbt desc="WaitForTransaction.confirmInProvider">
              Please confirm this transaction in{' '}
              <fbt:param name="provider">{provider}</fbt:param>
            </fbt>
          </div>
        </div>
      )
      if (this.props.contentOnly) {
        return content
      }
      return (
        <>
          <MobileLinkerCode role={role} />
          <Modal
            shouldClose={this.state.shouldClose}
            onClose={() => {
              this.setState({ shouldClose: false }, () => {
                this.props.onClose ? this.props.onClose() : null
              })
            }}
          >
            {content}
          </Modal>
        </>
      )
    }

    const poll = window.transactionPoll || 3000

    return (
      <Query query={query} variables={{ id }} pollInterval={poll}>
        {({ data, client, error }) => {
          const receipt = get(data, 'web3.transactionReceipt')
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
            console.error(error)
            content = <Error />
          } else if (!receipt) {
            content = <WaitForFirstBlock />
          } else if (!event) {
            console.error('Expected event not found')
            content = <Error />
          } else if (currentBlock <= confirmedBlock) {
            content = <WaitForConfirmation />
          } else {
            content = this.props.children({ event, client })
          }

          if (this.props.contentOnly) {
            return content
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

export default withWallet(WaitForTransaction)
