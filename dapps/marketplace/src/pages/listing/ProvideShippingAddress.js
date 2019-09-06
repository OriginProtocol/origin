import React, { useState, useCallback } from 'react'

import { fbt } from 'fbt-runtime'

import pick from 'lodash/pick'

import { withRouter } from 'react-router-dom'

import DocumentTitle from 'components/DocumentTitle'
import Redirect from 'components/Redirect'
import MobileModalHeader from 'components/MobileModalHeader'

import withIsMobile from 'hoc/withIsMobile'

import { formInput, formFeedback } from 'utils/formHelpers'

const ProvideShippingAddress = ({
  listing,
  isMobile,
  history,
  next,
  updateShippingAddress
}) => {
  const [inputState, setInputState] = useState({})
  const [valid, setValid] = useState(null)
  const [redirect, setRedirect] = useState(false)

  const input = formInput(
    inputState,
    useCallback(state => setInputState({ ...inputState, ...state }), [
      inputState
    ])
  )
  const Feedback = formFeedback(inputState)

  const validate = useCallback(() => {
    const newState = {}

    const stringFields = [
      'name',
      'address1',
      'address2',
      'city',
      'stateProvinceRegion',
      'country'
    ]

    for (const strField of stringFields) {
      if (!inputState[strField] || !inputState[strField].trim()) {
        newState[`${strField}Error`] = fbt(
          'This field is required',
          'This field is required'
        )
      }
    }

    if (!inputState.postalCode || !inputState.postalCode.length) {
      newState.postalCodeError = fbt(
        'Postal code is required',
        'Postal code is required'
      )
    } else {
      const v = Number(inputState.postalCode)
      if (Number.isNaN(v)) {
        newState.postalCodeError = fbt(
          'Postal code must be a number',
          'Postal code must be a number'
        )
      } else if (v <= 0) {
        newState.postalCodeError = fbt(
          'Invalid postal code',
          'Invalid postal code'
        )
      }
    }

    const valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    setInputState({
      ...inputState,
      ...newState
    })
    setValid(valid)

    return valid
  }, [valid, inputState])

  if (!listing) {
    return <Redirect to="/" />
  } else if (!listing.requiresShipping || redirect) {
    return <Redirect to={next} push />
  }

  return (
    <div className="container confirm-shipping-address">
      <DocumentTitle>{listing.title}</DocumentTitle>
      {!isMobile ? (
        <h1>
          <fbt desc="PurchaseListing.shippingAddressTitle">
            Shipping Address
          </fbt>
        </h1>
      ) : (
        <MobileModalHeader
          onBack={() => {
            history.goBack()
          }}
        >
          <fbt desc="PurchaseListing.shippingAddress">
            Provide a Shipping Address
          </fbt>
        </MobileModalHeader>
      )}
      <form
        className="shipping-address-form"
        onSubmit={e => {
          e.preventDefault()
          if (validate()) {
            updateShippingAddress(
              pick(inputState, [
                'name',
                'address1',
                'address2',
                'city',
                'stateProvinceRegion',
                'country',
                'postalCode'
              ])
            )

            setRedirect(true)
          } else {
            window.scrollTo(0, 0)
          }
        }}
      >
        {isMobile ? null : (
          <h2>
            <fbt desc="PurchaseListing.shippingAddress">
              Provide a Shipping Address
            </fbt>
          </h2>
        )}
        <div className="desc">
          <fbt desc="PurchaseListing.enterShippingAddress">
            Let the seller know where they should send your item.
          </fbt>
        </div>
        {valid !== false ? null : (
          <div className="alert alert-danger">
            <fbt desc="errorsInSubmissions">
              There were some errors in your submission. Fix them to continue.
            </fbt>
          </div>
        )}
        <div className="form-group">
          <label>
            <fbt desc="ShippingAddress.name">Name</fbt>
          </label>
          <input {...input('name')} />
          {Feedback('name')}
        </div>
        <div className="form-group">
          <label>
            <fbt desc="ShippingAddress.address1">Street Address 1</fbt>
          </label>
          <input {...input('address1')} />
          {Feedback('address1')}
        </div>
        <div className="form-group">
          <label>
            <fbt desc="ShippingAddress.address2">Street Address 2</fbt>
          </label>
          <input {...input('address2')} />
          {Feedback('address2')}
        </div>
        <div className="form-group">
          <label>
            <fbt desc="ShippingAddress.city">City</fbt>
          </label>
          <input {...input('city')} />
          {Feedback('city')}
        </div>
        <div className="form-group">
          <label>
            <fbt desc="ShippingAddress.region">State/Province/Region</fbt>
          </label>
          <input {...input('stateProvinceRegion')} />
          {Feedback('stateProvinceRegion')}
        </div>
        <div className="form-group">
          <label>
            <fbt desc="ShippingAddress.postalCode">Postal Code</fbt>
          </label>
          <input {...input('postalCode')} />
          {Feedback('postalCode')}
        </div>
        <div className="form-group">
          <label>
            <fbt desc="ShippingAddress.country">Country</fbt>
          </label>
          <input {...input('country')} />
          {Feedback('country')}
        </div>
        <div className="actions">
          <button type="submit" className="btn btn-primary btn-rounded">
            <fbt desc="Continue">Continue</fbt>
          </button>
          {isMobile ? null : (
            <button
              type="button"
              className="btn btn-outline-primary btn-rounded"
              onClick={() => history.goBack()}
            >
              <fbt desc="Cancel">Cancel</fbt>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default withRouter(withIsMobile(ProvideShippingAddress))

require('react-styl')(`
  .confirm-shipping-address
    padding: 0
    h1
      margin-top: 5rem
      text-align: center
    h2 
      margin-top: 3rem
      text-align: center
      font-weight: bold
    .shipping-address-form
      padding: 1rem 2.625rem
      max-width: 600px
      margin: 0 auto
      border: 1px solid #c2cbd3
      border-radius: 10px
      .desc
        font-size: 1.125rem
        margin-bottom: 1rem
        text-align: center
      .form-group
        margin: 1.25rem 0
        label
          font-weight: bold
          color: #0d1d29
          font-size: 1.125rem
          margin: 0
        input
          border-radius: 0
          border: 0
          border-bottom: 1px solid #c2cbd3
    .actions
      padding-top: 1.5rem
      .btn
        width: 100%
        padding: 0.875rem 0
        margin-top: 1rem
  
  @media (max-width: 767.98px)
    .confirm-shipping-address
      .shipping-address-form
        border: 0
        padding: 1rem
`)
