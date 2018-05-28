import React, { Component } from 'react'

import origin from '../../services/origin'

import Modal from 'components/modal'
import countryOptions from './_countryOptions'

class VerifyPhone extends Component {
  constructor() {
    super()
    this.state = {
      mode: 'phone',
      countryCode: 'us',
      number: '',
      code: '',
      prefix: '1'
    }
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
        <form
          onSubmit={async e => {
            e.preventDefault()
            var phone = `+${this.state.prefix}${this.state.number}`
            if (this.state.mode === 'phone') {
              await origin.attestations.phoneGenerateCode({ phone })
              this.setState({ mode: 'code' })
            } else if (this.state.mode === 'code') {
              let phoneAttestation = await origin.attestations.phoneVerify({
                phone, code: this.state.code
              })
              this.props.onSuccess(phoneAttestation)
            }
          }}
        >
          <h2>Verify Your Phone Number</h2>
          {this.state.mode === 'phone' && this.renderPhoneForm()}
          {this.state.mode === 'code' && this.renderCodeForm()}
          <div className="button-container">
            <button type="submit" className="btn btn-clear">
              Continue
            </button>
          </div>
          <div className="link-container">
            <a
              href="#"
              data-modal="phone"
              onClick={this.props.handleToggle}
            >
              Cancel
            </a>
          </div>
        </form>
      </Modal>
    )
  }

  renderPhoneForm() {
    return (
      <div className="form-group">
        <label htmlFor="phoneNumber">
          {'Enter your phone number below and Origin'}
          <sup>ID</sup>
          {' will send you a verification code'}
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
              {countryOptions.map(c => (
                <div
                  key={c.prefix}
                  className="dropdown-item d-flex"
                  onClick={() => {
                    this.setState({
                      countryCode: c.code,
                      prefix: c.prefix
                    })
                  }}
                >
                  <div>
                    <img
                      src={`images/flags/${c.code}.svg`}
                      role="presentation"
                      alt={`${c.code.toUpperCase()} flag`}
                    />
                  </div>
                  <div>{c.name}</div>
                  <div>+{c.prefix}</div>
                </div>
              ))}
            </div>
          </div>
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
        </div>
        <div className="explanation">
          {'Other users will know that you have a verified phone number. Your actual phone number '}
          <strong>will not</strong>
          {' be published on the blockchain.'}
        </div>
      </div>
    )
  }

  renderCodeForm() {
    return (
      <div className="form-group">
        <label htmlFor="phoneVerificationCode">
          Enter the code we sent you below
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
