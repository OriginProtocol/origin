import React, { Component } from 'react'

import Modal from 'components/Modal'

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
      console.log(this.props.data)
      reason = `Error with transaction. Please see console for details.`
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
            children="OK"
          />
        </div>
      </Modal>
    )
  }
}

export default CannotTransact
