import React, { useContext, useEffect } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import CurrencyContext from 'constants/CurrencyContext'
import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import WithPrices from 'components/WithPrices'
import Buy from './mutations/Buy'
import SelectQuantity from './_SelectQuantity'
import PaymentOptions from './_PaymentOptions'
import ConfirmPurchaseButton from './_ConfirmPurchaseButton'
import PurchaseSummary from './_PurchaseSummary'

const withMultiUnitData = WrappedComponent => {
  const WithMultiUnitData = ({ listing, quantity, ...props }) => {
    const amount = String(Number(listing.price.amount) * Number(quantity))
    const totalPrice = { amount, currency: listing.price.currency }

    return (
      <WithPrices
        listing={listing}
        price={totalPrice}
        targets={['token-ETH', 'token-DAI', totalPrice.currency.id]}
        allowanceTarget={listing.contractAddr}
      >
        {({ prices, tokenStatus, suggestedToken }) => (
          <WrappedComponent
            {...props}
            prices={prices}
            tokenStatus={tokenStatus}
            token={suggestedToken}
            listing={listing}
            totalPrice={totalPrice}
            quantity={quantity}
          />
        )}
      </WithPrices>
    )
  }

  return WithMultiUnitData
}

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
  prices,
  token,
  tokenStatus
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

/**
 * Renders the button that runs the makeOffer/swapAndMakeOffer mutation
 */
const BuyMultiUnitMutation = withMultiUnitData(
  ({
    refetch,
    listing,
    from,
    prices,
    token,
    tokenStatus,
    quantity,
    shippingAddress
  }) => (
    <Buy
      refetch={refetch}
      listing={listing}
      from={from}
      value={get(prices, `${token}.amount`)}
      quantity={quantity}
      currency={token}
      tokenStatus={tokenStatus}
      shippingAddress={shippingAddress}
      className="btn btn-primary"
      children={fbt('Purchase', 'Purchase')}
    />
  )
)

const MultiUnitPurchaseSummary = withMultiUnitData(PurchaseSummary)

export default withMultiUnitData(MultiUnit)

export { BuyMultiUnitMutation, MultiUnitPurchaseSummary }
