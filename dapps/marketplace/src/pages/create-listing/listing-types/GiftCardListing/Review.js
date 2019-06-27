import React from 'react'
import { fbt } from 'fbt-runtime'
import countryCodeMapping from '@origin/graphql/src/constants/CountryCodes'

import { CurrenciesByCountryCode } from 'constants/Currencies'
import Price from 'components/Price'
import GalleryScroll from 'components/GalleryScroll'
import Category from 'components/Category'
import FormattedDescription from 'components/FormattedDescription'

import Review from '../../Review'

const ReviewUnitListing = props => {
  // const quantity = Number(listing.quantity || 0)
  const listing = props.listing
  return (
    <Review {...props}>
      <div className="listing-review">
        <div className="title">{listing.title}</div>
        <div className="price-quantity">
          <div className="price">
            <Price
              target={listing.currency}
              price={{
                amount: listing.price,
                currency: { id: listing.currency }
              }}
            />
          </div>
          <div>
            <fbt desc="create.review.quantity">
              Quantity:
              <fbt:param name="quantity">{listing.quantity}</fbt:param>
            </fbt>
          </div>
        </div>
        <GalleryScroll pics={listing.media} />
        <div className="description">
          <FormattedDescription text={listing.description} />
        </div>
        <dl>
          <dt>
            <fbt desc="create.review.giftcard.cardAmount">Amount on Card</fbt>
          </dt>
          <dd>
            {CurrenciesByCountryCode[listing.issuingCountry][2]}
            {listing.cardAmount}
          </dd>
          <dt>
            <fbt desc="create.review.category">Category</fbt>
          </dt>
          <dd>
            <Category listing={listing} showPrimary={false} />
          </dd>
          <dt>
            <fbt desc="create.review.giftcard.retailer">Retailer</fbt>
          </dt>
          <dd>{listing.retailer}</dd>
          <dt>
            <fbt desc="create.review.giftcard.issuingCountry">
              Issuing Country
            </fbt>
          </dt>
          <dd>
            <img
              className="mr-2"
              style={{ maxWidth: 40 }}
              src={`images/flags/${listing.issuingCountry.toLowerCase()}.svg`}
            />
            {countryCodeMapping['en'][listing.issuingCountry]}
          </dd>
          <dt>
            <fbt desc="create.details.giftcard.isDigital">Card type</fbt>
          </dt>
          <dd>
            {listing.isDigital ? (
              <fbt desc="digital">Digital</fbt>
            ) : (
              <fbt desc="physical">Physical</fbt>
            )}
          </dd>
          <dt>
            <fbt desc="create.details.giftcard.isCashPurchase">
              Was this a cash purchase?
            </fbt>
          </dt>
          <dd>
            {listing.isCashPurchase ? (
              <fbt desc="yes">Yes</fbt>
            ) : (
              <fbt desc="no">No</fbt>
            )}
          </dd>
          <dt>
            <fbt desc="create.details.giftcard.receiptAvailable">
              Is a receipt available?
            </fbt>
          </dt>
          <dd>
            {listing.receiptAvailable ? (
              <fbt desc="yes">Yes</fbt>
            ) : (
              <fbt desc="no">No</fbt>
            )}
          </dd>
        </dl>
      </div>
    </Review>
  )
}

export default ReviewUnitListing
