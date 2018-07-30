import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

import origin from '../../services/origin'

class VerifyFacebook extends Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open && !this.state.url) {
      origin.attestations.facebookAuthUrl().then(url => {
        this.setState({ url })
      })
    }
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        data-modal="facebook"
        className="attestation"
        handleToggle={this.props.handleToggle}
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/facebook-icon-dark.svg" role="presentation" />
        </div>
        <h2>
          <FormattedMessage
            id={ 'VerifyFacebook.verifyFBHeading' }
            defaultMessage={ 'Verify Your Facebook Account' }
          />
        </h2>
        <div className="explanation">
          <FormattedMessage
            id={ 'VerifyFacebook.accountNotPublic' }
            defaultMessage={ 'Other users will know that you have a verified Facebook account, but your account details will not be published on the blockchain. We will never post on your behalf.' }
          />
        </div>
        <div className="button-container">
          <button
            type="submit"
            className="btn btn-clear"
            onClick={() => this.onCertify()}
          >
            <FormattedMessage
              id={ 'VerifyFacebook.continue' }
              defaultMessage={ 'Continue' }
            />
          </button>
        </div>
        <div className="link-container">
          <a
            href="#"
            data-modal="facebook"
            onClick={this.props.handleToggle}
          >
            <FormattedMessage
              id={ 'VerifyFacebook.cancel' }
              defaultMessage={ 'Cancel' }
            />
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
        .facebookVerify({ code: data.split(':')[1] })
        .then(result => this.props.onSuccess(result))
    }

    window.addEventListener('message', finish, false)
  }
}

export default VerifyFacebook
