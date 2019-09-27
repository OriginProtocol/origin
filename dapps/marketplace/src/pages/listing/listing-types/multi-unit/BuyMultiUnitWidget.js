import React, { useContext, useEffect } from 'react'
import { fbt } from 'fbt-runtime'

import CurrencyContext from 'constants/CurrencyContext'
import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import SelectQuantity from '../../_SelectQuantity'
import ConfirmPurchaseButton from '../../_ConfirmPurchaseButton'
import withMultiUnitData from './withMultiUnitData'

/**
 * Renders the buy widget and button that you see on the listing detail page
 * When user clicks on purchase, it takes you to Purchase confirmation page
 */
const MultiUnit = ({
  listing,
  quantity,
  updateQuantity,
  growthReward,
  isPendingBuyer,
  totalPrice,
  prices
}) => {
  if (!prices) return null

  const selectedCurrency = useContext(CurrencyContext)

  useEffect(() => {
    if (Number(quantity) > Number(listing.unitsAvailable)) {
      updateQuantity('1')
    }
  }, [])

  return (
    <div className="listing-buy multi">
      {!isPendingBuyer && (
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
      )}
      <SelectQuantity
        quantity={quantity}
        onChange={val => updateQuantity(val)}
        available={listing.unitsAvailable}
      />
      <div className="total">
        <span>
          <fbt desc="totalPrice">Total Price</fbt>
        </span>
        <span>
          <Price price={totalPrice} target="fiat-USD" />
        </span>
      </div>
      <ConfirmPurchaseButton
        listing={listing}
        className="btn btn-primary"
        children={fbt('Purchase', 'Purchase')}
      />
    </div>
  )
}

export default withMultiUnitData(MultiUnit)
