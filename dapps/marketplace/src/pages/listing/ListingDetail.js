import React, { Component } from 'react'
import AvailabilityCalculator from '@origin/graphql/src/utils/AvailabilityCalculator'
import AvailabilityCalculatorHourly from '@origin/graphql/src/utils/AvailabilityCalculatorHourly'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import withIsMobile from 'hoc/withIsMobile'
import withGrowthCampaign from 'hoc/withGrowthCampaign'
import withTokenBalance from 'hoc/withTokenBalance'
import withGrowthRewards from 'hoc/withGrowthRewards'

import Gallery from 'components/Gallery'
import GalleryScroll from 'components/GalleryScroll'
import Reviews from 'components/Reviews'
import AboutParty from 'components/AboutParty'
import Calendar from 'components/Calendar'
import WeekCalendar from 'components/WeekCalendar'
import DocumentTitle from 'components/DocumentTitle'
import Category from 'components/Category'

import Sold from './_ListingSold'
import Pending from './_ListingPending'
import Withdrawn from './_ListingWithdrawn'
import EditOnly from './_ListingEditOnly'
import OfferMade from './_ListingOfferMade'
import SingleUnit from './_BuySingleUnit'
import MultiUnit from './_BuyMultiUnit'
import Fractional from './_BuyFractional'
import FractionalHourly from './_BuyFractionalHourly'

import countryCodeMapping from '@origin/graphql/src/constants/CountryCodes'
import { CurrenciesByCountryCode } from 'constants/Currencies'

class ListingDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    if (props.listing.__typename === 'FractionalListing') {
      this.state.availability = new AvailabilityCalculator({
        weekdayPrice: get(props, 'listing.price.amount'),
        weekendPrice: get(props, 'listing.weekendPrice.amount'),
        booked: get(props, 'listing.booked'),
        unavailable: get(props, 'listing.unavailable'),
        customPricing: get(props, 'listing.customPricing')
      })
    }
    if (props.listing.__typename === 'FractionalHourlyListing') {
      this.state.availabilityHourly = new AvailabilityCalculatorHourly({
        booked: get(props, 'listing.booked'),
        unavailable: get(props, 'listing.unavailable'),
        customPricing: get(props, 'listing.customPricing'),
        timeZone: get(props, 'listing.timeZone'),
        workingHours: get(props, 'listing.workingHours'),
        price: get(props, 'listing.price.amount')
      })
    }
  }

  render() {
    const { listing, isMobile } = this.props

    return (
      <div className="container listing-detail">
        <DocumentTitle pageTitle={listing.title} />
        {isMobile ? (
          <>
            {this.renderHeading()}
            {this.renderListing()}
            {this.renderAction()}
            <h5>
              <fbt desc="listingDetail.about-the-seller">About the seller</fbt>
            </h5>
            <AboutParty id={listing.seller.id} />
            <Reviews id={listing.seller.id} seller />
          </>
        ) : (
          <div className="row">
            <div className="col-md-8 pb-3">
              {this.renderListing()}
              <hr />
              <Reviews id={listing.seller.id} seller />
            </div>
            <div className="col-md-4">
              {this.renderHeading()}
              {this.renderAction()}
              <h5>
                <fbt desc="listingDetail.about-the-seller">
                  About the seller
                </fbt>
              </h5>
              <AboutParty id={listing.seller.id} />
            </div>
          </div>
        )}
      </div>
    )
  }

  renderListing() {
    const { listing } = this.props
    const isFractional = listing.__typename === 'FractionalListing'
    const isFractionalHourly = listing.__typename === 'FractionalHourlyListing'
    const isGiftCard = listing.__typename === 'GiftCardListing'
    const isOwnerViewing = listing.seller.id === this.props.walletProxy
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const isDifferentTimeZone = listing.timeZone !== userTimeZone

    const description = (
      <div className="description">
        <h3>
          <fbt desc="ListingDetail.productDescription">Product Description</fbt>
        </h3>
        {String(listing.description).replace(/^\s+/, '')}
      </div>
    )
    return (
      <>
        {this.props.isMobile ? (
          <GalleryScroll pics={listing.media} />
        ) : (
          <Gallery pics={listing.media} />
        )}

        {isGiftCard || isFractional || isFractionalHourly ? null : description}
        {!isGiftCard ? null : (
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
                    <fbt desc="create.details.issuingCountry">
                      Issuing Country
                    </fbt>
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
                    <fbt desc="create.details.giftcard.isDigital">
                      Card type
                    </fbt>
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
        )}
        {!isFractional ? null : (
          <>
            {description}
            <hr />
            <Calendar
              interactive={!isOwnerViewing}
              small={true}
              onChange={state => this.setState(state)}
              availability={this.state.availability}
              currency={listing.price.currency}
            />
            <div className="availability-help">
              <fbt desc="listingDetail.calendarDateRange">
                * Click to select start date and again to select end date.
              </fbt>
            </div>
          </>
        )}
        {!isFractionalHourly ? null : (
          <>
            {description}
            <hr />
            <div className="timeZone">
              <div>
                <fbt desc="listingDetail.timeZone">Time Zone:</fbt>{' '}
                {listing.timeZone}
                {isDifferentTimeZone && (
                  <div>
                    <fbt desc="listingDetail.timeZoneWarning">
                      NOTE: This is different from your time zone of
                      <fbt:param name="userTimeZone">{userTimeZone}</fbt:param>
                    </fbt>
                  </div>
                )}
              </div>
            </div>
            <WeekCalendar
              interactive={!isOwnerViewing}
              small={true}
              onChange={state => this.setState(state)}
              availability={this.state.availabilityHourly}
              currency={listing.price.currency}
            />
            <div className="availability-help">
              <fbt desc="listingDetail.weekCalendarRangeHelp">
                * Click to select start time and again for end time
              </fbt>
            </div>
          </>
        )}
      </>
    )
  }

  renderHeading() {
    const { listing } = this.props
    return (
      <div className="heading">
        <div className="category">
          <Category listing={listing} />
        </div>
        <h2>{listing.title}</h2>
      </div>
    )
  }

  renderAction() {
    const { listing } = this.props
    const isFractional = listing.__typename === 'FractionalListing'
    const isFractionalHourly = listing.__typename === 'FractionalHourlyListing'
    const isAnnouncement = listing.__typename === 'AnnouncementListing'
    const isPendingBuyer = listing.pendingBuyers.some(
      b => b.id === this.props.walletProxy
    )

    const growthReward = this.props.ognListingRewards[listing.id]

    const props = { ...this.props }
    if (growthReward) {
      props.growthReward = growthReward
    }

    if (listing.seller.id === this.props.walletProxy) {
      return (
        <EditOnly
          {...this.props}
          isAnnouncement={isAnnouncement}
          isFractional={isFractional}
          isFractionalHourly={isFractionalHourly}
        />
      )
    } else if (isAnnouncement) {
      return null
    } else if (listing.status === 'sold') {
      return <Sold />
    } else if (isPendingBuyer && !listing.multiUnit) {
      return <OfferMade />
    } else if (isPendingBuyer && listing.multiUnit) {
      return (
        <>
          <MultiUnit {...props} />
          <OfferMade />
        </>
      )
    } else if (listing.status === 'pending') {
      return <Pending />
    } else if (listing.status === 'withdrawn') {
      return <Withdrawn />
    } else if (isFractional) {
      return (
        <Fractional
          {...props}
          range={this.state.range}
          availability={this.state.availability}
        />
      )
    } else if (isFractionalHourly) {
      return (
        <FractionalHourly
          {...props}
          range={this.state.range}
          availability={this.state.availabilityHourly}
        />
      )
    } else if (listing.multiUnit) {
      return <MultiUnit {...props} isPendingBuyer={isPendingBuyer} />
    }
    return <SingleUnit {...props} />
  }
}

export default withGrowthCampaign(
  withWallet(withTokenBalance(withGrowthRewards(withIsMobile(ListingDetail)))),
  {
    fetchPolicy: 'cache-first',
    queryEvenIfNotEnrolled: true,
    suppressErrors: true // still show listing detail in case growth can not be reached
  }
)

require('react-styl')(`
  .listing-detail
    margin-top: 2.5rem

    h2
      font-family: var(--heading-font)
      font-size: 36px
      font-weight: normal
      font-style: normal
      color: var(--dark)
      line-height: 1.25

    h5
      font-family: var(--heading-font)
      font-size: 18px
      margin-bottom: 1.25rem

    .header
      display: flex
      align-items: center
      justify-content: space-between

    .category
      font-family: var(--default-font)
      font-size: 14px
      color: var(--dusk)
      font-weight: normal
      text-transform: uppercase
      margin-top: 0.75rem

    .badge
      margin-top: 0.75rem

    .gallery
      margin-bottom: 1rem
      .main-pic
        padding-top: 56.6%
        background-size: contain
        background-repeat: no-repeat
        background-position: top center
        border: 1px solid var(--pale-grey-two)
        border-radius: 10px
      .thumbnails
        margin-top: 1rem

    .description
      border-top: 1px solid #dde6ea
      white-space: pre-wrap
      font-weight: normal
      margin-top: 4rem
      padding-top: 2rem
      h3
        font-family: Poppins
        font-size: 24px
        font-weight: 500

    .timeZone
      font-size: 1rem
      margin-bottom: 1rem

    .availability-help
      font-size: 14px
      margin-bottom: 1rem

    .field-row
      display: flex
      justify-content: space-between
      font-weight: normal
      margin-bottom: 1rem
      > span:nth-child(2)
        font-weight: bold
        text-align: right
    .country-flag-img
      width: 2rem
      height: 2rem
      margin-right: .5rem;

    .listing-buy
      padding-bottom: 2rem
      border-bottom: 1px solid #dde6ea
      margin-bottom: 2rem
      .btn-primary
        border-radius: 2rem
        padding: 0.5rem 1rem
        width: 100%
        font-size: 20px
      .quantity,.total
        font-family: var(--default-font)
        font-size: 18px
        color: #000
        font-weight: normal
        display: flex
        justify-content: space-between
        margin-bottom: 1.5rem
        span:last-child
          font-weight: bold
      .total
        padding-top: 0

      .price
        font-family: var(--default-font)
        font-size: 36px
        color: var(--dark)
        font-weight: bold
        line-height: 1
        padding-bottom: 1.5rem
        border-bottom: 1px solid #dde6ea
        margin-bottom: 1.5rem
        span.desc
          font-weight: normal
          margin-left: 0.25rem
          font-size: 18px
          color: var(--steel)
        .orig
          color: var(--steel)
          font-weight: normal
          margin-left: 1rem
          font-size: 16px
          display: none
      &.fractional
        .choose-dates
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem

          div:nth-child(1),div:nth-child(3)
            border-radius: var(--default-radius);
            padding: 0 5px;
            cursor: pointer
            &:hover
              background: var(--pale-grey-seven);
          div:nth-child(1)
            margin-left: -5px;
          div:nth-child(3)
            margin-right: -5px;

          div:nth-child(2)
            flex: 1
            background: url(images/arrow-right.svg) no-repeat center
            background-size: 1.25rem
          div:nth-child(3)
            text-align: right
      &.pending
        text-align: center
        font-weight: normal
        > div:nth-child(2)
          font-size: 24px;
          margin: 1rem 0;
        > div:nth-child(3)
          margin-bottom: 1rem

  @media (max-width: 767.98px)
    .listing-detail
      margin-top: 0.5rem
      h2
        font-size: 32px
      .description
        margin-top: 1rem
        margin-bottom: 2rem
      .about-party
        margin-bottom: 2rem
`)
