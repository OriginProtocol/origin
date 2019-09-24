import React, { useContext } from 'react'
import { fbt } from 'fbt-runtime'

import CurrencyContext from 'constants/CurrencyContext'

import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'

import DateRange from '../../_DateRange'
import ConfirmPurchaseButton from '../../_ConfirmPurchaseButton'

import withFractionalHourlyData from './withFractionalHourlyData'


/**
 * Renders the buy widget and button that you see on the listing detail page
 * When user clicks on purchase, it takes you to Purchase confirmation page
 */
const FractionalHourly = ({
  listing,
  range,
  growthReward,
  onShowAvailability,
  available,
  totalPrice,
  startDate,
  endDate
}) => {
  const selectedCurrency = useContext(CurrencyContext)
  const showUnavailable = range && !available

  return (
    <div className="listing-buy fractional">
      <div className="price">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex">
            <Price price={listing.price} />
            <div className="desc">/ hour</div>
          </div>
          <OgnBadge
            amount={growthReward}
            className="listing-detail-growth-reward"
          />
        </div>
        {listing.price.currency.id === selectedCurrency ? null : (
          <span className="orig">
            <Price price={listing.price} target={listing.price.currency.id} />
          </span>
        )}
      </div>
      <DateRange
        startDate={startDate}
        endDate={endDate}
        onClick={onShowAvailability}
        hideIfEmpty
        timeRange
      />
      {!showUnavailable ? null : (
        <div className="total">
          <fbt desc="Unavailable">Unavailable</fbt>
        </div>
      )}
      {!totalPrice ? (
        <button className="btn btn-primary" onClick={onShowAvailability}>
          {fbt('Availability', 'Availability')}
        </button>
      ) : (
        <>
          <div className="total">
            <span>
              <fbt desc="totalPrice">Total Price</fbt>
            </span>
            <span>
              <Price price={totalPrice} />
            </span>
          </div>
          <ConfirmPurchaseButton
            listing={listing}
            className={`btn btn-primary${available ? '' : ' disabled'}`}
            disabled={!available}
            children={fbt('Book', 'Book')}
          />
        </>
      )}
    </div>
  )
}

export default withFractionalHourlyData(FractionalHourly)
