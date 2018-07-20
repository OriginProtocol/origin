import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

import origin from '../../services/origin'

class VerifyEmail extends Component {
  constructor() {
    super()
    this.state = { 
      mode: 'email',
      email: '',
      code: '' ,
      formErrors: {},
      generalErrors: []
    }
  }

  render() {
    return (
      <Modal
        isOpen={this.props.open}
        data-modal="email"
        className="identity"
        handleToggle={this.props.handleToggle}
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/email-icon-dark.svg" role="presentation" />
        </div>
        <form onSubmit={ event => this.onSubmit(event)}>
          <h2>Verify Your Email Address</h2>
          <div className="general-error">{this.state.generalErrors.length > 0 ? this.state.generalErrors.join(' ') : ''}</div>
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
              onClick={event => this.onCancel(event)}
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

  onCancel(event) {
    event.preventDefault()
    this.clearErrors()
    this.setState({ mode: 'email' })
    this.props.handleToggle(event)
  }

  async onSubmit(event) {
    event.preventDefault()
    this.clearErrors()

    try{
      if (this.state.mode === 'email') {
        await origin.attestations.emailGenerateCode({
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
    } catch (exception) {
      const errorsJson = JSON.parse(exception).errors
        
      if (Array.isArray(errorsJson)) // Service exceptions
        this.setState({ generalErrors: errorsJson })
      else // Form exception
        this.setState({ formErrors: errorsJson })
    }

  }

  clearErrors() {
    // clear errors
    this.setState({formErrors: {}})
    this.setState({generalErrors:[]})
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
              onChange={e =>
                this.setState({ email: e.currentTarget.value })
              }
              placeholder={ <FormattedMessage
                              id={ 'VerifyEmail.validEmail' }
                              defaultMessage={ 'Valid email address' }
                            /> }
              required
            />
            <div className="error_message">{emailErrors ? emailErrors.join(' ') : ''}</div>
          </div>
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
          placeholder="Verification code"
          pattern="[a-zA-Z0-9]{6}"
          title="6-Character Verification Code"
          required
        />
      </div>
    )
  }
}

export default VerifyEmail
