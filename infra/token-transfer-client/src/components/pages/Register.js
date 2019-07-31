import React, { Component } from 'react'
// import request from 'superagent'

import { formInput, formFeedback } from '../../utils/formHelpers'

class Register extends Component {
  state = {
    name: '',
    nameError: null,
    email: '',
    emailError: null,
    phone: '',
    phoneError: null,
    saftDate: '',
    saftDateError: null,
    amountInvested: '',
    amountInvestedError: null,
    walletAddress: '',
    walletAddressError: null
  }

  handleRegister = () => {
    console.log('Register')
  }

  render() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <div className="action-card">
        <h1>Register</h1>
        <p>Please provide the information below to get started</p>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input {...input('name')} />
          {Feedback('name')}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input {...input('email')} />
          {Feedback('email')}
        </div>
        <div className="form-group">
          <label htmlFor="email">Phone Number</label>
          <input {...input('phone')} />
          <p>
            <small>
              Phone number will be used to verify large withdrawals.
            </small>
          </p>
          {Feedback('phone')}
        </div>
        <div className="form-group">
          <label htmlFor="email">Date of SAFT</label>
          <input {...input('saftDate')} />
          {Feedback('saftDate')}
        </div>
        <div className="form-group">
          <label htmlFor="email">Amount Invested</label>
          <input {...input('amountInvested')} />
          {Feedback('amountInvested')}
        </div>
        <div className="form-group">
          <label htmlFor="email">Wallet Address</label>
          <input {...input('walletAddress')} />
          {Feedback('walletAddress')}
        </div>
        <button
          className="btn btn-primary btn-lg"
          style={{ marginTop: '40px' }}
          onClick={this.handleRegister}
        >
          Continue
        </button>
      </div>
    )
  }
}

export default Register
