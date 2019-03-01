import React, { Component } from 'react'
import AvailabilityCalculator from 'origin-graphql/src/utils/AvailabilityCalculator'
import get from 'lodash/get'

import Gallery from 'components/Gallery'
import Link from 'components/Link'
import Reviews from 'components/Reviews'
import AboutParty from 'components/AboutParty'
import ListingBadge from 'components/ListingBadge'
import Calendar from 'components/Calendar'
import PageTitle from 'components/PageTitle'
import Category from 'components/Category'
import Price from 'components/Price'
import Tooltip from 'components/Tooltip'

import Buy from './mutations/Buy'

const SelectQuantity = ({ quantity, onChange, available }) => {
  return (
    <div className="quantity">
      <span>Quantity</span>
      <span>
        <select value={quantity} onChange={e => onChange(e.target.value)}>
          {Array(available)
            .fill(0)
            .map((v, idx) => (
              <option key={idx}>{idx + 1}</option>
            ))}
        </select>
      </span>
    </div>
  )
}

const Sold = () => (
  <div className="listing-buy pending">
    <div>This listing is</div>
    <div>Sold</div>
    <div>
      This listing is sold out. Try visiting the listings page and searching for
      something similar.
    </div>
    <Link to="/listings">View Listings</Link>
  </div>
)

const Pending = () => (
  <div className="listing-buy pending">
    <div>This listing is</div>
    <div>Pending</div>
    <div>
      Another buyer has already made an offer on this listing. Try visiting the
      listings page and searching for something similar.
    </div>
    <Link to="/listings">View Listings</Link>
  </div>
)

const SingleUnit = ({ listing, from, refetch }) => (
  <div className="listing-buy">
    <div className="price">
      <div className="eth">{`${listing.price.amount} ETH`}</div>
      <div className="usd">
        <Price amount={listing.price.amount} />
      </div>
    </div>
    <Buy
      refetch={refetch}
      listing={listing}
      from={from}
      value={listing.price.amount}
      quantity={1}
      className="btn btn-primary"
      children="Purchase"
    />
  </div>
)

const MultiUnit = ({ listing, from, quantity, updateQuantity, refetch }) => {
  const amount = String(Number(listing.price.amount) * Number(quantity))
  return (
    <div className="listing-buy multi">
      <div className="price">
        <div className="eth">
          {`${listing.price.amount} ETH`}
          {listing.multiUnit ? <span>{` / each`}</span> : null}
        </div>
        <div className="usd">
          <Price amount={listing.price.amount} />
        </div>
      </div>
      <SelectQuantity
        quantity={quantity}
        onChange={val => updateQuantity(val)}
        available={listing.unitsAvailable}
      />
      <div className="total">
        <span>Total Price</span>
        <span>{`${amount} ETH`}</span>
      </div>
      <Buy
        refetch={refetch}
        listing={listing}
        from={from}
        value={amount}
        quantity={quantity}
        className="btn btn-primary"
        children="Buy Now"
      />
    </div>
  )
}

const Fractional = ({ listing, from, range, availability, refetch }) => {
  let checkIn = 'Check in',
    checkOut = 'Check out',
    totalPrice,
    available = false,
    showUnavailable = false

  if (range) {
    const split = range.split('-')
    checkIn = split[0]
    checkOut = split[1]
    const priceEstimate = availability.estimatePrice(range)
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
        <div className="eth">{`${listing.price.amount} ETH / night`}</div>
        <div className="usd">
          <Price amount={listing.price.amount} />
        </div>
      </div>
      <div className="choose-dates form-control">
        <Tooltip
          tooltip="Scroll down for availability calendar"
          placement="top"
        >
          <div>{checkIn}</div>
        </Tooltip>
        <div className="arr" />
        <Tooltip
          tooltip="Scroll down for availability calendar"
          placement="top"
        >
          <div>{checkOut}</div>
        </Tooltip>
      </div>
      {!showUnavailable ? null : <div className="total">Unavailable</div>}
      {!totalPrice ? null : (
        <div className="total">
          <span>Total Price</span>
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
        startDate={checkIn}
        endDate={checkOut}
        className={`btn btn-primary${available ? '' : ' disabled'}`}
        children="Book"
      />
    </div>
  )
}

const ForSeller = ({ listing, isAnnouncement }) => (
  <div className="listing-buy">
    {isAnnouncement ? null : (
      <div className="price">
        <div className="eth">{`${listing.price.amount} ETH`}</div>
        <div className="usd">
          <Price amount={listing.price.amount} />
        </div>
      </div>
    )}
    <Link
      className="btn btn-primary mt-2"
      to={`/listing/${listing.id}/edit`}
      children={'Edit Listing'}
    />
  </div>
)

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
  }

  render() {
    const { listing } = this.props

    const isFractional = listing.__typename === 'FractionalListing'
    const sold = listing.status === 'sold'
    const pending = listing.status === 'pending'
    const isAnnouncement = listing.__typename === 'AnnouncementListing'

    return (
      <div className="listing-detail">
        <PageTitle>{listing.title}</PageTitle>
        <div className="header">
          <div className="category">
            <Category listing={listing} />
          </div>
          <ListingBadge status={listing.status} featured={listing.featured} />
        </div>
        <h2>{listing.title}</h2>
        <div className="row">
          <div className="col-md-8 pb-3">
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
            <hr />
            <Reviews id={listing.seller.id} />
          </div>
          <div className="col-md-4">
            {listing.seller.id === this.props.from ? (
              <ForSeller {...this.props} isAnnouncement={isAnnouncement} />
            ) : isAnnouncement ? null : sold ? (
              <Sold />
            ) : pending ? (
              <Pending />
            ) : isAnnouncement ? null : isFractional ? (
              <Fractional
                {...this.props}
                range={this.state.range}
                availability={this.state.availability}
              />
            ) : listing.multiUnit ? (
              <MultiUnit {...this.props} />
            ) : (
              <SingleUnit {...this.props} />
            )}

            <h5>About the Seller</h5>
            <AboutParty id={listing.seller.id} />
          </div>
        </div>
      </div>
    )
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

    .main-pic
      padding-top: 56.6%
      background-size: contain
      background-repeat: no-repeat
      background-position: top center

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
        padding: 1rem
        font-family: var(--default-font)
        font-size: 18px
        font-weight: normal
        display: flex
        justify-content: space-between
      .total
        padding-top: 0
      .price
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
      &.multi .price
        border-bottom: 1px solid var(--light)
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

`)
