import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import get from 'lodash/get'

import { formInput, formFeedback } from 'utils/formHelpers'
import useConfig from 'utils/useConfig'
import { useStateValue } from 'data/state'
import { Countries } from 'data/Countries'

import Link from 'components/Link'
import ShippingForm from './_ShippingForm'

import BetaWarning from './_BetaWarning'

function validate(state) {
  const newState = {}

  if (!state.email) {
    newState.emailError = 'Enter an email address'
  } else if (state.email.length < 3) {
    newState.emailError = 'Email is too short'
  }
  if (!state.firstName) {
    newState.firstNameError = 'Enter a first name'
  }
  if (!state.lastName) {
    newState.lastNameError = 'Enter a last name'
  }
  if (!state.address1) {
    newState.address1Error = 'Enter an address'
  }
  if (!state.city) {
    newState.cityError = 'Enter a city'
  }
  const provinces = get(Countries, `${state.country}.provinces`, {})
  if (!state.province && Object.keys(provinces).length) {
    newState.provinceError = 'Enter a state / province'
  }
  if (!state.zip) {
    newState.zipError = 'Enter a ZIP / postal code'
  }

  const valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

  return { valid, newState: { ...state, ...newState } }
}

const CheckoutInfo = () => {
  const { config } = useConfig()
  const history = useHistory()
  const [{ cart }, dispatch] = useStateValue()
  const [state, setStateRaw] = useState(
    cart.userInfo || { country: 'United States' }
  )
  const setState = newState => setStateRaw({ ...state, ...newState })

  const input = formInput(state, newState => setState(newState))
  const Feedback = formFeedback(state)

  return (
    <div className="checkout-information">
      <div className="d-none d-md-block">
        <h3>{config.fullTitle}</h3>
        <div className="breadcrumbs">
          <Link to="/cart">Cart</Link>
          <span>
            <b>Information</b>
          </span>
          <span>Shipping</span>
          <span>Payment</span>
        </div>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault()
          const { valid, newState } = validate(state)
          setState(newState)
          if (valid) {
            dispatch({ type: 'updateUserInfo', info: newState })
            history.push({
              pathname: '/checkout/shipping',
              state: { scrollToTop: true }
            })
          } else {
            window.scrollTo(0, 0)
          }
        }}
      >
        <div className="mb-3">
          <b>Contact information</b>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6 mb-0">
            <div className="form-group">
              <input type="email" placeholder="Email" {...input('email')} />
              {Feedback('email')}
            </div>
          </div>
          <div className="form-group col-md-6">
            <input
              type="tel"
              placeholder="Mobile phone (optional)"
              {...input('phone')}
            />
            {Feedback('phone')}
          </div>
        </div>
        <div className="mb-3">
          <b>Shipping Address</b>
        </div>

        <ShippingForm {...{ state, setState, input, Feedback }} />

        <div className="actions">
          <Link to="/cart">&laquo; Return to cart</Link>
          <button type="submit" className="btn btn-primary btn-lg">
            Continue to shipping
          </button>
        </div>
        <BetaWarning />
      </form>
    </div>
  )
}

export default CheckoutInfo

require('react-styl')(`
`)
