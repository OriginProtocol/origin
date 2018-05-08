import React, { Component } from 'react'
import Modal from 'components/modal'

import origin from '../../services/origin'

const redirectUrl = 'https://bridge-server-test.herokuapp.com/api/attestations/facebook/auth-url'

class VerifyFacebook extends Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    origin.attestations.facebookAuthUrl({ redirectUrl }).then(url => {
      this.setState({ url })
    })
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        data-modal="facebook"
        className="identity"
        handleToggle={this.props.handleToggle}
      >
        <div className="image-container d-flex align-items-center">
          <img src="/images/facebook-icon-dark.svg" role="presentation" />
        </div>
        <h2>Verify Your Facebook Account</h2>
        <div className="button-container">
          <a
            className="btn btn-clear"
            data-modal="facebook"
            onClick={this.props.handleToggle}
          >
            Cancel
          </a>
          <button
            type="submit"
            className="btn btn-clear"
            onClick={() => this.onCertify()}
          >
            Continue
          </button>
        </div>
      </Modal>
    )
  }

  onCertify() {
    var w = window.open(this.state.url, '', 'width=650,height=500')

    const finish = e => {
      if (String(e.data).match(/^signed-data:/)) {
        var [, signature, data, claimType] = e.data.split(':')
        this.props.updateForm({
          ...this.props.form,
          signature,
          data,
          claimType
        })
        this.props.handleIdentity('facebook')
      } else if (e.data !== 'success') {
        return
      }
      window.removeEventListener('message', finish, false)

      if (!w.closed) {
        w.close()
      }
    }

    window.addEventListener('message', finish, false)
  }
}

export default VerifyFacebook
