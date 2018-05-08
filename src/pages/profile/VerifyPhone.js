import React, { Component } from 'react'

import Modal from 'components/modal'
import countryOptions from './_countryOptions'

class VerifyPhone extends Component {
  render() {
    const {
      open,
      phoneForm,
      handleToggle,
      handleIdentity,
      updateForm
    } = this.props

    return (
      <Modal isOpen={open} data-modal="phone" className="identity" handleToggle={handleToggle}>
        <div className="image-container d-flex align-items-center">
          <img src="/images/phone-icon-dark.svg" role="presentation"/>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleIdentity('phone') }}>
          <h2>Verify Your Phone Number</h2>
          {!phoneForm.verificationRequested &&
            <div className="form-group">
              <label htmlFor="phoneNumber">Enter your phone number below</label>
              <div className="d-flex">
                <div className="country-code dropdown">
                  <div className="dropdown-toggle" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img src={`/images/flags/${phoneForm.countryCode}.svg`} role="presentation" alt={`${phoneForm.countryCode.toUpperCase()} flag`} />
                  </div>
                  <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                    {countryOptions.map(c => (
                      <div key={c.prefix} className="dropdown-item d-flex" onClick={() => {
                        updateForm(Object.assign({}, phoneForm, { countryCode: c.code }))
                      }}>
                        <div><img src={`/images/flags/${c.code}.svg`} role="presentation" alt={`${c.code.toUpperCase()} flag`} /></div>
                        <div>{c.name}</div>
                        <div>+{c.prefix}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <input type="phone" className="form-control" id="phoneNumber" name="phone-number" value={phoneForm.number} onChange={(e) => {
                  updateForm(Object.assign({}, phoneForm, { number: e.target.value }))
                }} placeholder="Area code and phone number" pattern="\d+" title="Numbers only" required />
              </div>
            </div>
          }
          {phoneForm.verificationRequested &&
            <div className="form-group">
              <label htmlFor="phoneVerificationCode">Enter the code we sent you below</label>
              <input className="form-control" id="phoneVerificationCode" name="phone-verification-code" value={phoneForm.verificationCode} onChange={(e) => {
                updateForm(Object.assign({}, phoneForm, { verificationCode: e.target.value }))
              }} placeholder="Verification code" pattern="[a-zA-Z0-9]{6}" title="6-Character Verification Code" required />
            </div>
          }
          <div className="button-container">
            <a className="btn btn-clear" data-modal="phone" onClick={handleToggle}>Cancel</a>
            <button type="submit" className="btn btn-clear">Continue</button>
          </div>
        </form>
      </Modal>
    )
  }
}

export default VerifyPhone
