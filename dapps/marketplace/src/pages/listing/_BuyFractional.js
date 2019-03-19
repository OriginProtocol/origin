import React from 'react'
import dayjs from 'dayjs'

import Price from 'components/Price2'
import Tooltip from 'components/Tooltip'

import Buy from './mutations/Buy'

const Fractional = ({ listing, from, range, availability, refetch }) => {
  let startDateDisplay = 'Check in',
    endDateDisplay = 'Check out',
    startDate = null,
    endDate = null,
    totalPrice,
    available = false,
    showUnavailable = false

  if (range) {
    const split = range.split('/')
    startDate = split[0]
    endDate = split[1]
    startDateDisplay = dayjs(startDate).format('ddd, MMM D')
    endDateDisplay = dayjs(endDate).format('ddd, MMM D')
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
        <Price price={listing.price} />
        <span className="desc">/ night</span>
      </div>
      <div className="choose-dates form-control">
        <Tooltip
          tooltip="Scroll down for availability calendar"
          placement="top"
        >
          <div>{startDateDisplay}</div>
        </Tooltip>
        <div className="arr" />
        <Tooltip
          tooltip="Scroll down for availability calendar"
          placement="top"
        >
          <div>{endDateDisplay}</div>
        </Tooltip>
      </div>
      {!showUnavailable ? null : <div className="total">Unavailable</div>}
      {!totalPrice ? null : (
        <div className="total">
          <span>Total Price</span>
          <span>
            <Price
              price={{ amount: totalPrice, currency: listing.price.currency }}
            />
          </span>
        </div>
      )}
      <Buy
        refetch={refetch}
        listing={listing}
        from={from}
        value={totalPrice}
        quantity={1}
        disabled={available ? false : true}
        startDate={startDate}
        endDate={endDate}
        className={`btn btn-primary${available ? '' : ' disabled'}`}
        children="Book"
      />
    </div>
  )
}

export default Fractional
