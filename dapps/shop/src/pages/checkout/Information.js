import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import { formInput, formFeedback } from 'utils/formHelpers'
import { useStateValue } from 'data/state'
import { Countries, CountriesDefaultInfo } from 'data/Countries'

import Link from 'components/Link'
import CountrySelect from 'components/CountrySelect'
import ProvinceSelect from 'components/ProvinceSelect'
import get from 'lodash/get'
import Site from 'constants/Site'

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
  if (!state.zip) {
    newState.zipError = 'Enter a ZIP / postal code'
  }

  const valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

  return { valid, newState: { ...state, ...newState } }
}

const CheckoutInfo = () => {
  const history = useHistory()
  const [{ cart }, dispatch] = useStateValue()
  const [state, setStateRaw] = useState(
    cart.userInfo || { country: 'United States', province: 'Alabama' }
  )
  const setState = newState => setStateRaw({ ...state, ...newState })

  const input = formInput(state, newState => setState(newState))
  const Feedback = formFeedback(state)

  const country = Countries[state.country || 'United States']

  return (
    <div className="checkout-information">
      <div className="d-none d-md-block">
        <h3>{Site.title}</h3>
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
          <b>Email</b>
        </div>
        <div className="form-group">
          <input type="email" placeholder="Email" {...input('email')} />
          {Feedback('email')}
        </div>
        <div className="mt-4 mb-3">
          <b>Shipping Address</b>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <input placeholder="First Name" {...input('firstName')} />
            {Feedback('firstName')}
          </div>
          <div className="form-group col-md-6">
            <input placeholder="Last Name" {...input('lastName')} />
            {Feedback('lastName')}
          </div>
        </div>
        <div className="form-group">
          <input placeholder="Address" {...input('address1')} />
          {Feedback('address1')}
        </div>
        <div className="form-group">
          <input
            placeholder="Appartment, suite, etc. (optional)"
            {...input('address2')}
          />
          {Feedback('address2')}
        </div>
        <div className="form-group">
          <input placeholder="City" {...input('city')} />
          {Feedback('city')}
        </div>
        <div className="form-row">
          <div className="form-group col-md">
            <CountrySelect
              className="form-control"
              value={state.country}
              onChange={e => {
                const provinces = get(Countries[e.target.value], 'provinces')
                setState({
                  country: e.target.value,
                  province: provinces ? Object.keys(provinces)[0] : ''
                })
              }}
            />
          </div>
          {!country.provinces ? null : (
            <div className="form-group col-md">
              <ProvinceSelect
                className="form-control"
                country={country}
                {...input('province')}
              />
            </div>
          )}
          <div className="form-group col-md">
            <input
              type="text"
              className="form-control"
              placeholder={get(
                country,
                'labels.zip',
                CountriesDefaultInfo.labels.zip
              )}
              {...input('zip')}
            />
          </div>
        </div>
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
