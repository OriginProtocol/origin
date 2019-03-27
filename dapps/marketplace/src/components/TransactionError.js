import React, { Component } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'

const UserDenied = /denied transaction signature/
const IncorrectNonce = /tx doesn't have the correct nonce/

class CannotTransact extends Component {
  state = {}

  render() {
    const modalProps = {
      shouldClose: this.state.shouldClose,
      submitted: this.state.success,
      onClose: () => this.props.onClose()
    }

    let reason = this.props.reason
    if (reason === 'load-error') {
      reason = fbt('Error loading wallet status', 'TransactionError.loadWallet')
    } else if (reason === 'loading') {
      reason = fbt('Error loading wallet status', 'TransactionError.loadWallet')
    } else if (reason === 'no-wallet') {
      reason = fbt('No wallet detected', 'TransactionError.noWalletDetected')
    } else if (reason === 'no-balance') {
      reason = fbt('Your wallet has no funds', 'TransactionError.noBalance')
    } else if (reason === 'wrong-network') {
      reason = fbt(
        'Please switch MetaMask to ' + fbt.param('network', this.props.data),
        'TransactionError.wrongNetwork'
      )
    } else if (reason === 'mutation') {
      if (get(this.props, 'data.message', '').match(UserDenied)) {
        reason = fbt(
          'You declined to sign the transaction',
          'TransactionError.declinedSigning'
        )
      } else if (get(this.props, 'data.message', '').match(IncorrectNonce)) {
        reason = fbt(
          'Incorrect nonce. Try resetting MetaMask.',
          'TransactionError.incorrectNonce'
        )
      } else {
        reason = (
          <div onClick={() => alert(this.props.data)}>
            <fbt desc="TransactionError.seeConsole">
              Error with transaction. Please see console for details.
            </fbt>
          </div>
        )
        console.warn(this.props.data)
      }
    }

    const content = (
      <div className="make-offer-modal">
        <div className="error-icon" />
        <div>{reason}</div>
        <button
          href="#"
          className="btn btn-outline-light"
          onClick={() =>
            this.props.contentOnly && this.props.onClose
              ? this.props.onClose()
              : this.setState({ shouldClose: true })
          }
          children={fbt('OK', 'OK')}
        />
      </div>
    )

    if (this.props.contentOnly) return content

    return <Modal {...modalProps}>{content}</Modal>
  }
}

export default CannotTransact
