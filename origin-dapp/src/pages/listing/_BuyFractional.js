import React from 'react'

import Price from 'components/Price'
import Tooltip from 'components/Tooltip'

import Buy from './mutations/Buy'

const Fractional = ({ listing, from, range, availability, refetch }) => {
  let checkIn = 'Check in',
    checkOut = 'Check out',
    totalPrice,
    available = false,
    showUnavailable = false

  if (range) {
    const split = range.split('-')
    checkIn = split[0]
    checkOut = split[1]
    const priceEstimate = availability.estimatePrice(range)
    available = priceEstimate.available
    if (available) {
      totalPrice = String(priceEstimate.price)
    } else {
      showUnavailable = true
    }
  }

  return (
    <div className="listing-buy fractional">
      <div className="price">
        <div className="eth">{`${listing.price.amount} ETH / night`}</div>
        <div className="usd">
          <Price amount={listing.price.amount} />
        </div>
      </div>
      <div className="choose-dates form-control">
        <Tooltip
          tooltip="Scroll down for availability calendar"
          placement="top"
        >
          <div>{checkIn}</div>
        </Tooltip>
        <div className="arr" />
        <Tooltip
          tooltip="Scroll down for availability calendar"
          placement="top"
        >
          <div>{checkOut}</div>
        </Tooltip>
      </div>
      {!showUnavailable ? null : <div className="total">Unavailable</div>}
      {!totalPrice ? null : (
        <div className="total">
          <span>Total Price</span>
          <span>{`${totalPrice} ETH`}</span>
        </div>
      )}
      <Buy
        refetch={refetch}
        listing={listing}
        from={from}
        value={totalPrice}
        quantity={1}
        disabled={available ? false : true}
        startDate={checkIn}
        endDate={checkOut}
        className={`btn btn-primary${available ? '' : ' disabled'}`}
        children="Book"
      />
    </div>
  )
}

export default Fractional
