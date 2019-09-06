import React, { useState, useCallback, useRef, useEffect } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'
import get from 'lodash/get'

import Redirect from 'components/Redirect'
import Link from 'components/Link'

import { formInput, formFeedback } from 'utils/formHelpers'

import RequireShipping from './_RequireShipping'

const Quantity = ({ next, onChange, prev, ...props }) => {
  const listing = omit(props.listing, 'valid')
  const [valid, setValid] = useState(null)

  const [inputState, setInputState] = useState({
    quantity: get(props.listing, 'quantity')
  })

  const input = formInput(
    inputState,
    useCallback(
      state => {
        setInputState({
          ...inputState,
          ...state
        })
      },
      [inputState]
    )
  )

  const Feedback = formFeedback(inputState)

  const validate = useCallback(() => {
    const newInputState = {}

    if (!inputState.quantity) {
      newInputState.quantityError = fbt(
        'Quantity is required',
        'create.error.Quantity is required'
      )
    }

    const valid = Object.keys(newInputState).every(f => f.indexOf('Error') < 0)

    if (!valid) {
      window.scrollTo(0, 0)
    } else if (onChange) {
      onChange({
        ...listing,
        ...inputState
      })
    }

    setInputState(newInputState)
    setValid(valid)

    return valid
  }, [onChange, inputState, valid, listing])

  const quantityInput = useRef(null)

  useEffect(() => {
    if (quantityInput && quantityInput.current) {
      quantityInput.current.focus()
    }
  }, [])

  if (valid) {
    return <Redirect to={next} push />
  }

  return (
    <>
      <h1>
        <Link to={prev} className="back d-md-none" />
        <fbt desc="createListing.listingDetails">Listing Details</fbt>
      </h1>
      <div className="row">
        <div className="col-md-8">
          <form
            className="listing-step"
            autoComplete="off"
            onSubmit={e => {
              e.preventDefault()
              validate()
            }}
          >
            {valid !== false ? null : (
              <div className="alert alert-danger">
                <fbt desc="fix errors">Please fix the errors below...</fbt>
              </div>
            )}
            <div className="form-group">
              <label>
                <fbt desc="create.details.quantity">Quantity</fbt>
              </label>
              <input ref={quantityInput} {...input('quantity')} />
              {Feedback('quantity')}
            </div>

            <RequireShipping
              onChange={requiresShipping => {
                setInputState({
                  ...inputState,
                  requiresShipping
                })
              }}
            />

            <div className="actions">
              <Link
                className="btn btn-outline-primary d-none d-md-inline-block"
                to={prev}
              >
                <fbt desc="back">Back</fbt>
              </Link>
              <button type="submit" className="btn btn-primary">
                <fbt desc="continue">Continue</fbt>
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-4 d-none d-md-block">
          <div className="gray-box">
            <fbt desc="create.details.help">
              <h5>Add Listing Details</h5>
              Be sure to give your listing an appropriate title and description
              to let others know what you&apos;re offering. Adding some photos
              will increase the chances of selling your listing.
            </fbt>
          </div>
        </div>
      </div>
    </>
  )
}

export default Quantity
