import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import origin from '../../services/origin'

import Modal from 'components/modal'
import CountryOptions from './_countryOptions'

class VerifyPhone extends Component {
  constructor() {
    super()
    this.state = {
      mode: 'phone',
      countryCode: 'us',
      number: '',
      code: '',
      prefix: '1',
      formErrors: {},
      generalErrors: []
    }

    this.setSelectedCountry = this.setSelectedCountry.bind(this)
  }

  setSelectedCountry(country) {
    this.setState({
      countryCode: country.code,
      prefix: country.prefix
    })
  }

  render() {
    const { open, handleToggle } = this.props

    return (
      <Modal
        isOpen={open}
        data-modal="phone"
        className="identity"
        handleToggle={handleToggle}
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/phone-icon-dark.svg" role="presentation" />
        </div>
        <form onSubmit={(event) => this.onSubmit(event)}>
          <h2>
            <FormattedMessage
              id={ 'VerifyPhone.verifyPhoneHeading' }
              defaultMessage={ 'Verify Your Phone Number' }
            />
          </h2>
          {this.state.mode === 'phone' && this.renderPhoneForm()}
          {this.state.mode === 'code' && this.renderCodeForm()}
          <div className="general-error">{this.state.generalErrors.length > 0 ? this.state.generalErrors.join(' ') : ''}</div>
          <div className="button-container">
            <button type="submit" className="btn btn-clear">
              <FormattedMessage
                id={ 'VerifyPhone.continue' }
                defaultMessage={ 'Continue' }
              />
            </button>
          </div>
          <div className="link-container">
            <a
              href="#"
              data-modal="phone"
              onClick={event => this.onCancel(event)}
            >
              <FormattedMessage
                id={ 'VerifyPhone.cancel' }
                defaultMessage={ 'Cancel' }
              />
            </a>
          </div>
        </form>
      </Modal>
    )
  }

  clearErrors() {
    // clear errors
    this.setState({formErrors: {}})
    this.setState({generalErrors:[]})
  }

  onCancel(event) {
    event.preventDefault()
    this.clearErrors()
    this.setState({ mode: 'phone' })

    this.props.handleToggle(event)
  }

  async onSubmit(event) {
    event.preventDefault()
    this.clearErrors()

    const phone = `+${this.state.prefix}${this.state.number}`

    try {
      if (this.state.mode === 'phone') {
        await origin.attestations.phoneGenerateCode({ phone })
        this.setState({ mode: 'code' })
      } else if (this.state.mode === 'code') {
        let phoneAttestation = await origin.attestations.phoneVerify({
          phone, code: this.state.code
        })
        this.props.onSuccess(phoneAttestation)
      }
    } catch (exception) {
      const errorsJson = JSON.parse(exception).errors
        
      if (Array.isArray(errorsJson)) // Service exceptions
        this.setState({ generalErrors: errorsJson })
      else // Form exception
        this.setState({ formErrors: errorsJson })
    }
  }

  renderPhoneForm() {
    const phoneErrors = this.state.formErrors.phone

    return (
      <div className="form-group">
        <label htmlFor="phoneNumber">
          <FormattedMessage
            id={ 'VerifyPhone.enterPhoneNumber' }
            defaultMessage={ 'Enter your phone number below and {originId} will send you a verification code' }
            values={{ originId: <span>Origin<sup>ID</sup></span> }}
          />
        </label>
        <div className="d-flex">
          <div className="country-code dropdown">
            <div
              className="dropdown-toggle"
              role="button"
              id="dropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <img
                src={`images/flags/${this.state.countryCode}.svg`}
                role="presentation"
                alt={`${this.state.countryCode.toUpperCase()} flag`}
              />
            </div>
            <div className="dropdown-menu">
              <CountryOptions setSelectedCountry={ this.setSelectedCountry } />
            </div>
          </div>
          <div className={`form-control-wrap ${phoneErrors ? 'error' : ''}`}>
            <input
              type="phone"
              className="form-control"
              id="phoneNumber"
              name="phone-number"
              value={this.state.number}
              onChange={e => {
                this.setState({ number: e.target.value })
              }}
              placeholder="Area code and phone number"
              pattern="\d+"
              title="Numbers only"
              required
            />
            <div className="error_message">{phoneErrors ? phoneErrors.join(' ') : ''}</div>
          </div>
        </div>
        <div className="explanation">
           <FormattedMessage
            id={ 'VerifyPhone.phoneNumberNotPublished' }
            defaultMessage={ 'Other users will know that you have a verified phone number. Your actual phone number will not be published on the blockchain.' }
          />
        </div>
      </div>
    )
  }

  renderCodeForm() {
    return (
      <div className="form-group">
        <label htmlFor="phoneVerificationCode">
          <FormattedMessage
            id={ 'VerifyPhone.enterCodeBelow' }
            defaultMessage={ 'Enter the code we sent you below' }
          />
        </label>
        <input
          className="form-control"
          id="phoneVerificationCode"
          name="phone-verification-code"
          value={this.state.code}
          onChange={e => {
            this.setState({ code: e.target.value })
          }}
          placeholder="Verification code"
          pattern="[a-zA-Z0-9]{6}"
          title="6-Character Verification Code"
          required
        />
      </div>
    )
  }
}

export default VerifyPhone
