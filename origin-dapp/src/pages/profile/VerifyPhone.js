import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import Modal from 'components/modal'
import Dropdown from 'components/dropdown'

import CountryOptions from './_countryOptions'

import origin from '../../services/origin'

class VerifyPhone extends Component {
  constructor() {
    super()
    this.state = {
      mode: 'phone',
      countryCode: 'us',
      countryCallingCode: '1',
      phone: '',
      verificationCode: '',
      verificationMethod: 'sms',
      formErrors: {},
      generalErrors: []
    }

    this.intlMessages = defineMessages({
      phoneVerificationCodePlaceholder: {
        id: 'VerifyPhone.phoneVerificationCodePlaceholder',
        defaultMessage: 'Verification code'
      },
      phoneVerificationNumberPlaceholder: {
        id: 'VerifyPhone.phoneVerificationNumberPlaceholder',
        defaultMessage: 'Area code and phone number'
      }
    })

    this.handleSubmit = this.handleSubmit.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.setSelectedCountry = this.setSelectedCountry.bind(this)
    this.toggleVerificationMethod = this.toggleVerificationMethod.bind(this)
  }

  async handleSubmit(e) {
    e.preventDefault()
    this.clearErrors()

    const {
      countryCallingCode,
      mode,
      phone,
      verificationCode,
      verificationMethod
    } = this.state

    const phoneObj = {
      countryCallingCode,
      phone: String(phone)
    }

    try {
      if (mode === 'phone') {
        await origin.attestations.phoneGenerateCode({
          ...phoneObj,
          method: verificationMethod
        })
        // Update mode to display verification code input form
        this.setState({ mode: 'code' })
      } else if (mode === 'code') {
        const phoneAttestation = await origin.attestations.phoneVerify({
          ...phoneObj,
          code: verificationCode
        })

        this.props.onSuccess(phoneAttestation)
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

  setSelectedCountry(country) {
    this.setState({
      countryCode: country.code,
      countryCallingCode: country.prefix,
      countryDropdown: false
    })
  }

  toggleVerificationMethod(event) {
    // Toggle between SMS and call verification
    event.preventDefault()
    if (this.state.verificationMethod === 'sms') {
      this.setState({ verificationMethod: 'call' })
    } else if (this.state.verificationMethod === 'call') {
      this.setState({ verificationMethod: 'sms' })
    }
  }

  render() {
    const { open, handleToggle } = this.props

    return (
      <Modal
        isOpen={open}
        className="attestation phone"
        handleToggle={handleToggle}
        tabIndex="-1"
      >
        <div className="image-container d-flex align-items-center">
          <img src="images/phone-icon-dark.svg" role="presentation" />
        </div>
        <form onSubmit={this.handleSubmit}>
          <h2>
            <FormattedMessage
              id={'VerifyPhone.verifyPhoneHeading'}
              defaultMessage={'Verify Your Phone Number'}
            />
          </h2>
          {this.state.generalErrors.length > 0 && (
            <div className="general-error">
              {this.state.generalErrors.join(' ')}
            </div>
          )}
          {this.state.mode === 'phone' && this.renderPhoneForm()}
          {this.state.mode === 'code' && this.renderCodeForm()}
          <div className="button-container d-md-flex flex-md-row justify-content-md-center pt-4">
            <button
              className="btn btn-clear d-md-none col-5 col-sm-4"
              data-modal="phone"
              onClick={this.onCancel}
              >
              <FormattedMessage
                id={'VerifyPhone.cancel'}
                defaultMessage={'Cancel'}
              />
            </button>
            <button
              type="submit"
              className="btn btn-clear col-5 col-sm-4"
            >
              <FormattedMessage
                id={'VerifyPhone.continue'}
                defaultMessage={'Continue'}
              />
            </button>
          </div>
          <div className="link-container d-none d-md-block">
            <a href="#" data-modal="phone" onClick={this.onCancel}>
              <FormattedMessage
                id={'VerifyPhone.cancel'}
                defaultMessage={'Cancel'}
              />
            </a>
          </div>
        </form>
      </Modal>
    )
  }

  clearErrors() {
    // clear errors
    this.setState({ formErrors: {} })
    this.setState({ generalErrors: [] })
  }

  onCancel(event) {
    event.preventDefault()
    this.clearErrors()
    this.setState({ mode: 'phone' })

    this.props.handleToggle(event)
  }

  renderPhoneForm() {
    const phoneErrors = this.state.formErrors.phone

    return (
      <div className="form-group">
        <label htmlFor="phoneNumber">
          {this.state.verificationMethod === 'sms' && (
            <div>
              <FormattedMessage
                id={'VerifyPhone.enterPhoneNumberSms'}
                defaultMessage={
                  'Enter your phone number below and {originId} will send you a verification code via SMS.'
                }
                values={{
                  originId: (
                    <span>
                      Origin<sup>ID</sup>
                    </span>
                  )
                }}
              />
              <div>
                <a href="#" onClick={this.toggleVerificationMethod}>
                  <FormattedMessage
                    id={'VerifyPhone.callOption'}
                    defaultMessage={'Prefer a call?'}
                  />
                </a>
              </div>
            </div>
          )}
          {this.state.verificationMethod === 'call' && (
            <div>
              <FormattedMessage
                id={'VerifyPhone.enterPhoneNumberCall'}
                defaultMessage={
                  'Enter your phone number below and {originId} will call you with a verification code.'
                }
                values={{
                  originId: (
                    <span>
                      Origin<sup>ID</sup>
                    </span>
                  )
                }}
              />
              <div>
                <a href="#" onClick={this.toggleVerificationMethod}>
                  <FormattedMessage
                    id={'VerifyPhone.smsOption'}
                    defaultMessage={'Prefer a SMS?'}
                  />
                </a>
              </div>
            </div>
          )}
        </label>
        <div className="d-flex">
          <Dropdown
            className="country-code"
            onClose={() => this.setState({ countryDropdown: false })}
            open={this.state.countryDropdown}
          >
            <div
              className="dropdown-toggle"
              role="button"
              id="dropdownMenuLink"
              onClick={() =>
                this.setState({
                  countryDropdown: this.state.countryDropdown ? false : true
                })
              }
              aria-haspopup="true"
              aria-expanded="false"
            >
              <img
                src={`images/flags/${this.state.countryCode}.svg`}
                role="presentation"
                alt={`${this.state.countryCode.toUpperCase()} flag`}
              />
            </div>
            <div
              className={`dropdown-menu${
                this.state.countryDropdown ? ' show' : ''
              }`}
            >
              <CountryOptions setSelectedCountry={this.setSelectedCountry} />
            </div>
          </Dropdown>
          <div className={`form-control-wrap ${phoneErrors ? 'error' : ''}`}>
            <input
              type="tel"
              className="form-control"
              id="phoneNumber"
              name="phone-number"
              value={this.state.phone}
              onChange={e => {
                this.setState({ phone: e.target.value })
              }}
              placeholder={this.props.intl.formatMessage(
                this.intlMessages.phoneVerificationNumberPlaceholder
              )}
              pattern="\d+"
              title="Numbers only"
              required
            />
            {phoneErrors && (
              <div className="error_message">{phoneErrors.join(' ')}</div>
            )}
          </div>
        </div>
        <div className="explanation">
          <FormattedMessage
            id={'VerifyPhone.phoneNumberNotPublished'}
            defaultMessage={
              'Other users will know that you have a verified phone number. Your actual phone number will not be published on the blockchain.'
            }
          />
        </div>
      </div>
    )
  }

  renderCodeForm() {
    const codeError = this.state.formErrors.code

    return (
      <div className="form-group">
        <label htmlFor="phoneVerificationCode">
          <FormattedMessage
            id={'VerifyPhone.enterCodeBelow'}
            defaultMessage={'Enter the code we sent you below'}
          />
        </label>
        <div
          className={`form-control-wrap wide-control ${
            codeError ? 'error' : ''
          }`}
        >
          <input
            type="tel"
            className="form-control"
            id="phoneVerificationCode"
            name="phone-verification-code"
            value={this.state.verificationCode}
            onChange={e => {
              this.setState({ verificationCode: e.target.value })
            }}
            placeholder={this.props.intl.formatMessage(
              this.intlMessages.phoneVerificationCodePlaceholder
            )}
            pattern="[a-zA-Z0-9]{6}"
            title="6-Character Verification Code"
            required
          />
          {codeError && (
            <div className="error_message">{codeError.join(' ')}</div>
          )}
        </div>
      </div>
    )
  }
}

export default injectIntl(VerifyPhone)
