import React, { useContext } from 'react'
import { fbt } from 'fbt-runtime'

import CurrencyContext from 'constants/CurrencyContext'

import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'

import DateRange from '../../_DateRange'
import ConfirmPurchaseButton from '../../_ConfirmPurchaseButton'
import withFractionalData from './withFractionalData'

/**
 * Renders the buy widget and button that you see on the listing detail page
 * When user clicks on purchase, it takes you to Purchase confirmation page
 */
const Fractional = ({
  listing,
  range,
  growthReward,
  onShowAvailability,

  startDate,
  endDate,
  totalPrice,
  available
}) => {
  const selectedCurrency = useContext(CurrencyContext)

  const showUnavailable = range && !available

  return (
    <div className="listing-buy fractional">
      <div className="price">
        <div className="d-flex justify-content-between align-items-center">
          <Price listing={listing} descriptor />
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

export default withFractionalData(Fractional)
