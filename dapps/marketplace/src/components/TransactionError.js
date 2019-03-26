import React, { Component } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'

const UserDenied = /denied transaction signature/

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

    return (
      <Modal {...modalProps}>
        <div className="make-offer-modal">
          <div className="error-icon" />
          <div>{reason}</div>
          <button
            href="#"
            className="btn btn-outline-light"
            onClick={() => this.setState({ shouldClose: true })}
            children={fbt('OK', 'OK')}
          />
        </div>
      </Modal>
    )
  }
}

export default CannotTransact
