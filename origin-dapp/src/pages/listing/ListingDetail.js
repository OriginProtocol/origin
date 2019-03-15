import React, { Component } from 'react'
import AvailabilityCalculator from 'origin-graphql/src/utils/AvailabilityCalculator'
import get from 'lodash/get'

import Gallery from 'components/Gallery'
import Reviews from 'components/Reviews'
import AboutParty from 'components/AboutParty'
import ListingBadge from 'components/ListingBadge'
import Calendar from 'components/Calendar'
import PageTitle from 'components/PageTitle'
import Category from 'components/Category'

import Sold from './_ListingSold'
import Pending from './_ListingPending'
import EditOnly from './_ListingEditOnly'
import OfferMade from './_ListingOfferMade'
import SingleUnit from './_BuySingleUnit'
import MultiUnit from './_BuyMultiUnit'
import Fractional from './_BuyFractional'

class ListingDetail extends Component {
  constructor(props) {
    super(props)
    this.state = { mobile: window.innerWidth < 767 }
    this.onResize = this.onResize.bind(this)
    if (props.listing.__typename === 'FractionalListing') {
      this.state.availability = new AvailabilityCalculator({
        weekdayPrice: get(props, 'listing.price.amount'),
        weekendPrice: get(props, 'listing.weekendPrice.amount'),
        booked: get(props, 'listing.booked'),
        unavailable: get(props, 'listing.unavailable'),
        customPricing: get(props, 'listing.customPricing')
      })
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize() {
    if (window.innerWidth < 767 && !this.state.mobile) {
      this.setState({ mobile: true })
    } else if (window.innerWidth >= 767 && this.state.mobile) {
      this.setState({ mobile: false })
    }
  }

  render() {
    const { listing } = this.props
    const isMobile = this.state.mobile

    return (
      <div className="container listing-detail">
        <PageTitle>{listing.title}</PageTitle>
        <div className="header">
          <div className="category">
            <Category listing={listing} />
          </div>
          <ListingBadge status={listing.status} featured={listing.featured} />
        </div>
        <h2>{listing.title}</h2>

        {isMobile ? (
          <>
            {this.renderListing()}
            {this.renderAction()}
            <h5>About the Seller</h5>
            <AboutParty id={listing.seller.id} />
            <Reviews id={listing.seller.id} />
          </>
        ) : (
          <div className="row">
            <div className="col-md-8 pb-3">
              {this.renderListing()}
              <hr />
              <Reviews id={listing.seller.id} />
            </div>
            <div className="col-md-4">
              {this.renderAction()}
              <h5>About the Seller</h5>
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

    return (
      <>
        <Gallery pics={listing.media} />
        <div className="description">{listing.description}</div>
        {!isFractional ? null : (
          <>
            <hr />
            <Calendar
              small={true}
              onChange={state => this.setState(state)}
              availability={this.state.availability}
            />
            <div className="availability-help">
              * Click and drag to select a date range
            </div>
          </>
        )}
      </>
    )
  }

  renderAction() {
    const { listing } = this.props
    const isFractional = listing.__typename === 'FractionalListing'
    const isAnnouncement = listing.__typename === 'AnnouncementListing'
    const isPendingBuyer = listing.pendingBuyers.some(
      b => b.id === this.props.from
    )

    if (listing.seller.id === this.props.from) {
      return (
        <EditOnly
          {...this.props}
          isAnnouncement={isAnnouncement}
          isFractional={isFractional}
        />
      )
    } else if (isAnnouncement) {
      return null
    } else if (listing.status === 'sold') {
      return <Sold />
    } else if (isPendingBuyer && !listing.multiUnit) {
      return <OfferMade />
    } else if (listing.status === 'pending') {
      return <Pending />
    } else if (isFractional) {
      return (
        <Fractional
          {...this.props}
          range={this.state.range}
          availability={this.state.availability}
        />
      )
    } else if (listing.multiUnit) {
      return <MultiUnit {...this.props} isPendingBuyer={isPendingBuyer} />
    }
    return <SingleUnit {...this.props} />
  }
}

export default ListingDetail

require('react-styl')(`
  .listing-detail
    margin-top: 2.5rem

    h2
      font-family: var(--heading-font)
      font-size: 40px
      font-weight: 200
      font-style: normal
      color: var(--dark)
      line-height: 1.25

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

    .description
      white-space: pre-wrap

    .availability-help
      font-size: 14px
      margin-bottom: 1rem

    .listing-buy
      padding: 1.5rem
      border-radius: var(--default-radius);
      background-color: var(--pale-grey-eight)
      margin-bottom: 1rem
      > .btn
        border-radius: 2rem
        padding: 0.5rem 1rem
        width: 100%
      .quantity,.total
        font-family: var(--default-font)
        font-size: 18px
        color: #000
        font-weight: normal
        display: flex
        justify-content: space-between
        margin-bottom: 1rem
        span:last-child
          font-weight: bold
      .total
        padding-top: 0

      .price
        font-family: var(--default-font)
        font-size: 22px
        color: var(--dark)
        font-weight: bold
        line-height: 1
        margin-bottom: 1rem
        span.desc
          font-weight: normal
          margin-left: 0.25rem
        .orig
          color: var(--steel)
          font-weight: normal
          margin-left: 1rem
          font-size: 16px
      .price-old
        display: flex
        align-items: baseline
        margin-bottom: 1.5rem
        white-space: nowrap
        flex-wrap: wrap
        .eth
          background: url(images/eth-icon.svg) no-repeat
          background-size: 1.5rem
          padding-left: 2rem
          line-height: 1.5rem
          font-family: var(--default-font)
          font-size: 24px
          font-weight: bold
          font-style: normal
          color: #000000
          > span
            font-weight: normal
        .usd
          color: var(--steel)
          font-weight: normal
          margin-left: 1rem
          font-size: 16px
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
