import React, { Component } from 'react'
import get from 'lodash/get'

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
      reason = 'Error loading wallet status'
    } else if (reason === 'loading') {
      reason = 'Error loading wallet status'
    } else if (reason === 'no-wallet') {
      reason = 'No wallet detected'
    } else if (reason === 'no-balance') {
      reason = 'Your wallet has no funds'
    } else if (reason === 'wrong-network') {
      reason = `Please switch MetaMask to ${this.props.data}`
    } else if (reason === 'mutation') {
      if (get(this.props, 'data.message', '').match(UserDenied)) {
        reason = 'You declined to sign the transaction'
      } else {
        reason = (
          <div onClick={() => alert(this.props.data)}>
            Error with transaction. Please see console for details.
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
          children="OK"
        />
      </div>
    )

    if (this.props.contentOnly) return content

    return <Modal {...modalProps}>{content}</Modal>
  }
}

export default CannotTransact
