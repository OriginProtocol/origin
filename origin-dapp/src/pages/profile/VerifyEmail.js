import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import Modal from 'components/modal'

import origin from '../../services/origin'

class VerifyEmail extends Component {
  constructor() {
    super()
    this.state = {
      mode: 'email',
      email: '',
      code: '',
      formErrors: {},
      generalErrors: []
    }

    this.intlMessages = defineMessages({
      emailVerificationAddressPlaceholder: {
        id: 'VerifyEmail.emailVerificationAddressPlaceholder',
        defaultMessage: 'Verify email address'
      },
      emailVerificationCodePlaceholder: {
        id: 'VerifyEmail.emailVerificationCodePlaceholder',
        defaultMessage: 'Verification code'
      }
    })

    this.handleCancel = this.handleCancel.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        className="email attestation"
        handleToggle={this.props.handleToggle}
        tabIndex="-1"
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/email-icon-dark.svg" role="presentation" />
        </div>
        <form onSubmit={this.handleSubmit}>
          <h2>Verify Your Email Address</h2>
          {this.state.generalErrors.length > 0 && (
            <div className="general-error">
              {this.state.generalErrors.join(' ')}
            </div>
          )}
          {this.state.mode === 'email'
            ? this.renderEmailForm()
            : this.renderCodeForm()}
          <div className="button-container d-md-flex flex-md-row justify-content-md-center pt-4">
            <button
              className="btn btn-clear d-md-none col-5 col-sm-4"
              data-modal="email"
              onClick={this.handleCancel}
            >
              <FormattedMessage
                id={'VerifyEmail.cancel'}
                defaultMessage={'Cancel'}
              />
            </button>
            <button
              type="submit"
              className="btn btn-clear col-5 col-sm-4"
            >
              <FormattedMessage
                id={'VerifyEmail.continue'}
                defaultMessage={'Continue'}
              />
            </button>
          </div>
          <div className="link-container d-none d-md-block">
            <a href="#" data-modal="email" onClick={this.handleCancel}>
              <FormattedMessage
                id={'VerifyEmail.cancel'}
                defaultMessage={'Cancel'}
              />
            </a>
          </div>
        </form>
      </Modal>
    )
  }

  handleCancel(event) {
    event.preventDefault()
    this.clearErrors()
    this.setState({ mode: 'email' })
    this.props.handleToggle(event)
  }

  async handleSubmit(event) {
    event.preventDefault()
    this.clearErrors()

    try {
      if (this.state.mode === 'email') {
        await origin.attestations.emailGenerateCode({
          email: this.state.email
        })
        this.setState({ mode: 'code' })
      } else if (this.state.mode === 'code') {
        const emailAttestation = await origin.attestations.emailVerify({
          email: this.state.email,
          code: this.state.code,
          wallet: this.props.wallet
        })
        this.props.onSuccess(emailAttestation)
      }
    } catch (exception) {
      const errorsJson = JSON.parse(exception).errors

      if (Array.isArray(errorsJson))
        // Service exceptions
        this.setState({ generalErrors: errorsJson })
      // Form exception
      else this.setState({ formErrors: errorsJson })
    }
  }

  clearErrors() {
    this.setState({ formErrors: {} })
    this.setState({ generalErrors: [] })
  }

  renderEmailForm() {
    const emailErrors = this.state.formErrors.email

    return (
      <div className="form-group">
        <label htmlFor="email">
          {'Enter your email address below and Origin'}
          <sup>ID</sup>
          {' will send you a verification code'}
        </label>
        <div className={`form-control-wrap ${emailErrors ? 'error' : ''}`}>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={this.state.email}
            onChange={e => this.setState({ email: e.currentTarget.value })}
            placeholder={this.props.intl.formatMessage(
              this.intlMessages.emailVerificationAddressPlaceholder
            )}
            required
          />
          {emailErrors ? (
            <div className="error_message">{emailErrors.join(' ')}</div>
          ) : (
            ''
          )}
        </div>
        <div className="explanation">
          <FormattedMessage
            id={'VerifyEmail.emailNotPublished'}
            defaultMessage={
              'Other users will know that you have a verified email address. Your actual email address will not be published on the blockchain.'
            }
          />
        </div>
      </div>
    )
  }

  renderCodeForm() {
    const codeErrors = this.state.formErrors.code
    return (
      <div className="form-group">
        <label htmlFor="emailVerificationCode">
          <FormattedMessage
            id={'VerifyEmail.enterCode'}
            defaultMessage={'Enter the code we sent you below'}
          />
        </label>
        <div className={`form-control-wrap ${codeErrors ? 'error' : ''}`}>
          <input
            type="tel"
            className="form-control"
            id="emailVerificationCode"
            name="email-verification-code"
            value={this.state.code}
            onChange={e => this.setState({ code: e.currentTarget.value })}
            placeholder={this.props.intl.formatMessage(
              this.intlMessages.emailVerificationCodePlaceholder
            )}
            pattern="[a-zA-Z0-9]{6}"
            title="6-Character Verification Code"
            required
          />
          {codeErrors ? (
            <div className="error_message">{codeErrors.join(' ')}</div>
          ) : (
            ''
          )}
        </div>
      </div>
    )
  }
}

export default injectIntl(VerifyEmail)
