import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
import MetaMaskAnimation from 'components/MetaMaskAnimation'
import query from 'queries/TransactionReceipt'
import withWallet from 'hoc/withWallet'
import withConfig from 'hoc/withConfig'
import Sentry from 'utils/sentry'

const INVALID_JSON_RPC = 'Invalid JSON RPC response'

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
    if (id === 'pending') {
      const walletType = this.props.walletType
      const provider =
        walletType && walletType === 'Mobile' ? 'mobile wallet' : walletType
      const metaTxEnabled = get(this.props, 'config.relayerEnabled') === true

      const content = (
        <div className="make-offer-modal">
          {provider === 'MetaMask' ? <MetaMaskAnimation /> : <Confirm />}
          <div>
            {metaTxEnabled && walletType === 'Mobile' ? (
              <fbt desc="WaitForTransaction.confirmInProvider.metaTx">
                Waiting for confirmation...
              </fbt>
            ) : (
              <fbt desc="WaitForTransaction.confirmInProvider">
                Please confirm this transaction in{' '}
                <fbt:param name="provider">{provider}</fbt:param>
              </fbt>
            )}
          </div>
        </div>
      )
      if (this.props.contentOnly) {
        return content
      }
      return (
        <Modal
          shouldClose={this.state.shouldClose}
          onClose={() => {
            this.setState({ shouldClose: false }, () => {
              this.props.onClose ? this.props.onClose() : null
            })
          }}
          disableDismiss={true}
        >
          {content}
        </Modal>
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
          // Catch errors, but ignore one-off JSON-RPC errors
          if (
            error &&
            (error.message && !error.message.indexOf(INVALID_JSON_RPC))
          ) {
            console.error(error)
            Sentry.captureException(error)
            content = <Error />
          } else if (!receipt || !confirmedBlock) {
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
              disableDismiss={true}
              children={content}
            />
          )
        }}
      </Query>
    )
  }
}

export default withConfig(withWallet(WaitForTransaction))
