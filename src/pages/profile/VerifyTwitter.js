import React, { Component } from 'react'
import Modal from 'components/modal'

import origin from '../../services/origin'

class VerifyTwitter extends Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open && !this.state.url) {
      origin.attestations.twitterAuthUrl().then(url => {
        this.setState({ url })
      })
    }
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        data-modal="twitter"
        className="identity"
        handleToggle={this.props.handleToggle}
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/twitter-icon-dark.svg" role="presentation" />
        </div>
        <h2>Verify Your Twitter Account</h2>
        <div className="explanation">
          Other users will know that you have a verified Twitter account. Your username
          &nbsp;
          <strong>will not</strong>
          &nbsp;
          be published on the blockchain. We will never tweet on your behalf.
        </div>
        <div className="button-container">
          <button
            type="submit"
            className="btn btn-clear"
            onClick={() => this.onCertify()}
          >
            Continue
          </button>
        </div>
        <div className="link-container">
          <a
            href="#"
            data-modal="twitter"
            onClick={this.props.handleToggle}
          >
            Cancel
          </a>
        </div>
      </Modal>
    )
  }

  onCertify() {
    var w = window.open(this.state.url, '', 'width=650,height=500')

    const finish = e => {
      var data = String(e.data)
      if (!data.match(/^origin-code:/)) {
        return
      }
      window.removeEventListener('message', finish, false)
      if (!w.closed) {
        w.close()
      }

      origin.attestations
        .twitterVerify({ code: data.split(':')[1] })
        .then(result => this.props.onSuccess(result))
    }

    window.addEventListener('message', finish, false)
  }
}

export default VerifyTwitter
