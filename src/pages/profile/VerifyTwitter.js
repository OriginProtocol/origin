import React, { Component } from 'react'

import Modal from 'components/modal'

class VerifyTwitter extends Component {
  render() {
    return (
      <Modal
        isOpen={this.props.open}
        data-modal="twitter"
        className="identity"
        handleToggle={this.props.handleToggle}
      >
        <div className="image-container d-flex align-items-center">
          <img src="/images/twitter-icon-dark.svg" role="presentation" />
        </div>
        <h2>Verify Your Twitter Account</h2>
        <pre style={{ color: 'white', fontSize: '1.5rem' }}>To Do &#10003;</pre>
        <form
          onSubmit={e => {
            e.preventDefault()
            this.props.onSuccess({
              claimType: 4,
              data: '0x00',
              signature: '0x00'
            })
          }}
        >
          <div className="button-container">
            <a
              className="btn btn-clear"
              data-modal="twitter"
              onClick={this.props.handleToggle}
            >
              Cancel
            </a>
            <button type="submit" className="btn btn-clear">
              Continue
            </button>
          </div>
        </form>
      </Modal>
    )
  }
}

export default VerifyTwitter
