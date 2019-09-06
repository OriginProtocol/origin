import React, { useContext } from 'react'
import dayjs from 'dayjs'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import CurrencyContext from 'constants/CurrencyContext'

import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import WithPrices from 'components/WithPrices'
import PaymentOptions from './_PaymentOptions'

import Buy from './mutations/Buy'
import DateRange from './_DateRange'
import ConfirmShippingAndPurchase from './_ConfirmShippingAndPurchase'
import PurchaseSummary from './_PurchaseSummary'

const withFractionalHourlyData = WrappedComponent => {
  const WithFractionalHourlyData = ({
    listing,
    range,
    availability,
    ...props
  }) => {
    const acceptsDai = listing.acceptedTokens.find(t => t.id === 'token-DAI')
    const token = acceptsDai ? 'token-DAI' : 'token-ETH'

    let startDate = null,
      endDate = null,
      totalPrice,
      available = false

    if (range) {
      const split = range.split('/')
      startDate = split[0]
      endDate = split[1]
      const priceEstimate = availability.estimatePrice(
        `${startDate}/${dayjs(endDate)
          .add(-1, 'hour')
          .format('YYYY-MM-DDTHH:00:00')}`
      )
      available = priceEstimate.available
      if (available) {
        totalPrice = {
          amount: String(priceEstimate.price),
          currency: listing.price.currency
        }
      }
    }

    return (
      <WithPrices
        price={totalPrice}
        target={token}
        targets={['token-ETH', 'token-DAI', listing.price.currency.id]}
        allowanceTarget={listing.contractAddr}
      >
        {({ prices, tokenStatus }) => (
          <WrappedComponent
            {...props}
            prices={prices}
            tokenStatus={tokenStatus}
            token={token}
            acceptsDai={acceptsDai}
            listing={listing}
            startDate={startDate}
            endDate={endDate}
            totalPrice={totalPrice}
            availability={availability}
            available={available}
            range={range}
          />
        )}
      </WithPrices>
    )
  }

  return WithFractionalHourlyData
}

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
  token,
  tokenStatus,
  startDate,
  endDate,
  prices
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
          <PaymentOptions
            tokens={prices}
            price={totalPrice}
            acceptedTokens={listing.acceptedTokens}
            value={token}
            hasBalance={tokenStatus.hasBalance}
            hasEthBalance={tokenStatus.hasEthBalance}
          >
            <ConfirmShippingAndPurchase
              listing={listing}
              className={`btn btn-primary${available ? '' : ' disabled'}`}
              disabled={!available}
              children={fbt('Book', 'Book')}
            />
          </PaymentOptions>
        </>
      )}
    </div>
  )
}

/**
 * Renders the button that runs the makeOffer/swapAndMakeOffer mutation
 */
const BuyFractionalHourlyMutation = withFractionalHourlyData(
  ({
    refetch,
    listing,
    from,
    prices,
    token,
    tokenStatus,
    startDate,
    endDate,
    available
  }) => {
    return (
      <Buy
        refetch={refetch}
        listing={listing}
        from={from}
        value={get(prices, `['${token}'].amount`)}
        quantity={1}
        disabled={available ? false : true}
        startDate={startDate}
        endDate={endDate}
        currency={token}
        tokenStatus={tokenStatus}
        className={`btn btn-primary${available ? '' : ' disabled'}`}
        children={fbt('Book', 'Book')}
      />
    )
  }
)

const FractionalHourlyPurchaseSummary = withFractionalHourlyData(
  PurchaseSummary
)

export default withFractionalHourlyData(FractionalHourly)

export { BuyFractionalHourlyMutation, FractionalHourlyPurchaseSummary }
