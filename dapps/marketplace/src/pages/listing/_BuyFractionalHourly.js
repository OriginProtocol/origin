import React from 'react'
import dayjs from 'dayjs'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'
import Tooltip from 'components/Tooltip'

import Buy from './mutations/Buy'

const FractionalHourly = ({ listing, from, range, availability, refetch }) => {
  let startDateDisplay = fbt('Start', 'Start'),
    endDateDisplay = fbt('End', 'End'),
    startDate = null,
    endDate = null,
    totalPrice,
    available = false,
    showUnavailable = false

  if (range) {
    const split = range.split('/')
    startDate = split[0]
    endDate = split[1]
    startDateDisplay = dayjs(startDate).format('MMM D h:00a') // Needs l10n
    endDateDisplay = dayjs(endDate).format('MMM D h:00a') // Needs l10n
    const priceEstimate = availability.estimatePrice(
      `${startDate}/${dayjs(endDate)
        .add(-1, 'hour')
        .format('YYYY-MM-DDTHH:00:00')}`
    )
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
        <div className="eth">
          {listing.price.amount}
          <fbt desc="ethPerHour">ETH / hour</fbt>
        </div>
        <div className="usd">
          <Price amount={listing.price.amount} />
        </div>
      </div>
      <div className="choose-dates form-control">
        <Tooltip
          tooltip={fbt(
            'Scroll down for availability calendar',
            'Scroll down for availability calendar'
          )}
          placement="top"
        >
          <div>{startDateDisplay}</div>
        </Tooltip>
        <div className="arr" />
        <Tooltip
          tooltip={fbt(
            'Scroll down for availability calendar',
            'Scroll down for availability calendar'
          )}
          placement="top"
        >
          <div>{endDateDisplay}</div>
        </Tooltip>
      </div>
      {!showUnavailable ? null : (
        <div className="total">
          <fbt desc="Unavailable">Unavailable</fbt>
        </div>
      )}
      {!totalPrice ? null : (
        <div className="total">
          <span>
            <fbt desc="totalPrice">Total Price</fbt>
          </span>
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
        startDate={startDate}
        endDate={endDate}
        className={`btn btn-primary${available ? '' : ' disabled'}`}
        children={fbt('Book', 'Book')}
      />
    </div>
  )
}

export default FractionalHourly
