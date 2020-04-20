import React, { useState } from 'react'
import get from 'lodash/get'

import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'
import useIsMobile from 'utils/useIsMobile'

const Btn = ({
  dispatch,
  donation,
  amount,
  other,
  setOther,
  setOtherValue
}) => {
  const active = donation === amount && !other
  return (
    <button
      type="button"
      className={`btn btn${active ? '' : '-outline'}-secondary`}
      onClick={() => {
        setOther(false)
        setOtherValue(String(amount / 100))
        dispatch({ type: 'setDonation', amount })
      }}
    >{`$${amount / 100}`}</button>
  )
}

const Donation = ({ cart }) => {
  const amounts = [0, 500, 1000, 2000, 5000]
  const donation = cart.donation || 0

  const [other, setOther] = useState(amounts.indexOf(donation) < 0)
  const [otherValue, setOtherValue] = useState(String(donation / 100))
  const [error, setError] = useState('')
  const { config } = useConfig()
  const [, dispatch] = useStateValue()
  const isMobile = useIsMobile()
  if (!config.donations || !cart || !cart.items) return null

  const props = {
    dispatch,
    donation,
    other,
    setOther,
    setOtherValue
  }

  return (
    <form
      className="donation"
      onSubmit={async e => {
        e.preventDefault()
        if (other || isMobile) {
          if (otherValue.match(/^[0-9]+$/)) {
            const amount = Number(otherValue)
            if (amount > 50000) {
              setError('Amount is too large')
            } else {
              setError('')
              dispatch({ type: 'setDonation', amount: amount * 100 })
            }
          } else {
            setError('Please enter a number')
          }
        }
      }}
    >
      <div>
        <div>
          {'Extra Donation to '}
          <a
            href={get(config, 'donations.url')}
            target="_blank"
            rel="noopener noreferrer"
            children={get(config, 'donations.name')}
          />
        </div>
        {isMobile ? null : (
          <div className="btn-group">
            {amounts.map(amount => (
              <Btn key={amount} {...props} amount={amount} />
            ))}

            <button
              className={`btn btn-${other ? '' : 'outline-'}secondary`}
              onClick={() => setOther(true)}
            >
              Other
            </button>
          </div>
        )}

        {!isMobile && !other ? null : (
          <div className="d-flex align-items-baseline">
            <div className="input-group mt-3">
              <div className="input-group-prepend">
                <div className="input-group-text">$</div>
              </div>
              <input
                type="text"
                className={`form-control${error ? ' is-invalid' : ''}`}
                placeholder="Other Amount"
                value={otherValue}
                onChange={e => {
                  const value = e.target.value
                  setOtherValue(value)
                }}
              />
              {!error ? null : (
                <div className="invalid-feedback" style={{ display: 'block' }}>
                  {error}
                </div>
              )}
            </div>

            <button className="btn btn-primary ml-2" type="submit">
              Apply
            </button>
          </div>
        )}
      </div>
    </form>
  )
}

export default Donation

require('react-styl')(`
  .donation
    a
      color: #00f
    > div
      flex-direction: column
      .btn-group
        margin-top: 0.5rem
    .btn-outline-secondary
      color: #000
      &:hover
        color: #fff
`)
