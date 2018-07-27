import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import Modal from 'components/modal'

import origin from '../../services/origin'

class VerifyEmail extends Component {
  constructor() {
    super()
    this.state = { mode: 'email', email: '', code: '' }

    this.intlMessages = defineMessages({
      emailVerificationAddressPlaceholder: {
        id: 'VerifyEmail.emailVerificationAddressPlaceholder',
        defaultMessage: 'Verify email address',
      },
      emailVerificationCodePlaceholder: {
        id: 'VerifyEmail.emailVerificationCodePlaceholder',
        defaultMessage: 'Verification code',
      },
    })
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        data-modal="email"
        className="attestation"
        handleToggle={this.props.handleToggle}
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/email-icon-dark.svg" role="presentation" />
        </div>
        <form
          onSubmit={async e => {
            e.preventDefault()
            if (this.state.mode === 'email') {
              origin.attestations.emailGenerateCode({
                email: this.state.email
              })
              this.setState({ mode: 'code' })
            } else if (this.state.mode === 'code') {
              let emailAttestation = await origin.attestations.emailVerify({
                email: this.state.email,
                code: this.state.code,
                wallet: this.props.wallet
              })
              this.props.onSuccess(emailAttestation)
            }
          }}
        >
          <h2>Verify Your Email Address</h2>
          {this.state.mode === 'email'
            ? this.renderEmailForm()
            : this.renderCodeForm()}
          <div className="button-container">
            <button type="submit" className="btn btn-clear">
              <FormattedMessage
                id={ 'VerifyEmail.continue' }
                defaultMessage={ 'Continue' }
              />
            </button>
          </div>
          <div className="link-container">
            <a
              href="#"
              data-modal="email"
              onClick={this.props.handleToggle}
            >
              <FormattedMessage
                id={ 'VerifyEmail.cancel' }
                defaultMessage={ 'Cancel' }
              />
            </a>
          </div>
        </form>
      </Modal>
    )
  }

  renderEmailForm() {
    return (
      <div className="form-group">
        <label htmlFor="email">
          {'Enter your email address below and Origin'}
          <sup>ID</sup>
          {' will send you a verification code'}
        </label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={this.state.email}
          onChange={e =>
            this.setState({ email: e.currentTarget.value })
          }
          placeholder={this.props.intl.formatMessage(this.intlMessages.emailVerificationAddressPlaceholder)}
          required
        />
        <div className="explanation">
          <FormattedMessage
            id={ 'VerifyEmail.emailNotPublished' }
            defaultMessage={ 'Other users will know that you have a verified email address. Your actual email address will not be published on the blockchain.' }
          />
        </div>
      </div>
    )
  }

  renderCodeForm() {
    return (
      <div className="form-group">
        <label htmlFor="emailVerificationCode">
          <FormattedMessage
            id={ 'VerifyEmail.enterCode' }
            defaultMessage={ 'Enter the code we sent you below' }
          />
        </label>
        <input
          className="form-control"
          id="emailVerificationCode"
          name="email-verification-code"
          value={this.state.code}
          onChange={e => this.setState({ code: e.currentTarget.value })}
          placeholder={this.props.intl.formatMessage(this.intlMessages.emailVerificationCodePlaceholder)}
          pattern="[a-zA-Z0-9]{6}"
          title="6-Character Verification Code"
          required
        />
      </div>
    )
  }
}

export default injectIntl(VerifyEmail)
