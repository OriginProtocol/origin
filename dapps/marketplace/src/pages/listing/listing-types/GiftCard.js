import React from 'react'
import { fbt } from 'fbt-runtime'

import countryCodeMapping from '@origin/graphql/src/constants/CountryCodes'
import { CurrenciesByCountryCode } from 'constants/Currencies'

const GiftCardDetail = ({ listing, description }) => (
  <>
    <div className="row">
      <div className="card-details col-sm-6">
        <div className="field-row">
          <span>
            <fbt desc="create.details.retailer">Retailer</fbt>
          </span>
          <span>{listing.retailer}</span>
        </div>
        <div className="field-row">
          <span>
            <fbt desc="create.details.cardAmount">Amount on Card</fbt>
          </span>
          <span>
            {CurrenciesByCountryCode[listing.issuingCountry][2]}
            {listing.cardAmount}
          </span>
        </div>
        <div className="field-row">
          <span>
            <fbt desc="create.details.issuingCountry">Issuing Country</fbt>
          </span>
          <span>
            <img
              className="country-flag-img"
              src={`images/flags/${listing.issuingCountry.toLowerCase()}.svg`}
            />
            {countryCodeMapping['en'][listing.issuingCountry]}
          </span>
        </div>
      </div>
      <div className="card-details col-sm-6">
        <div className="field-row">
          <span>
            <fbt desc="create.details.giftcard.isDigital">Card type</fbt>
          </span>
          <span>
            {listing.isDigital ? (
              <fbt desc="digital">Digital</fbt>
            ) : (
              <fbt desc="physical">Physical</fbt>
            )}
          </span>
        </div>
        <div className="field-row">
          <span>
            <fbt desc="create.details.giftcard.isCashPurchase">
              Was this a cash purchase?
            </fbt>
          </span>
          <span>
            {listing.isCashPurchase ? (
              <fbt desc="yes">Yes</fbt>
            ) : (
              <fbt desc="no">No</fbt>
            )}
          </span>
        </div>
        <div className="field-row">
          <span>
            <fbt desc="create.details.giftcard.receiptAvailable">
              Is a receipt available?
            </fbt>
          </span>
          <span>
            {listing.receiptAvailable ? (
              <fbt desc="yes">Yes</fbt>
            ) : (
              <fbt desc="no">No</fbt>
            )}
          </span>
        </div>
      </div>
    </div>
    {description}
  </>
)

export default GiftCardDetail
