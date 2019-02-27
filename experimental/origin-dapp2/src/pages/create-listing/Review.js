import React, { Component } from 'react'
import AvailabilityCalculator from 'origin-graphql/src/utils/AvailabilityCalculator'

import Redirect from 'components/Redirect'
import Link from 'components/Link'
import Wallet from 'components/Wallet'
import Price from 'components/Price'
import CoinPrice from 'components/CoinPrice'
import Calendar from 'components/Calendar'
import Category from 'components/Category'

import CreateListing from './mutations/CreateListing'
import UpdateListing from './mutations/UpdateListing'

class Review extends Component {
  state = {}
  render() {
    const isEdit = this.props.mode === 'edit'
    const prefix = isEdit ? `/listing/${this.props.listingId}/edit` : '/create'

    const { listing, tokenBalance } = this.props
    if (!listing.subCategory) {
      return <Redirect to={`${prefix}/step-1`} />
    } else if (!listing.title) {
      return <Redirect to={`${prefix}/step-2`} />
    }

    const quantity = Number(listing.quantity || 0)
    const isMulti = quantity > 1
    const isFractional = this.props.listingType === 'fractional'
    const boost = tokenBalance >= Number(listing.boost) ? listing.boost : '0'

    return (
      <div className="row create-listing-review">
        <div className="col-md-8">
          <h2>Review your listing</h2>

          <div className="detail">
            <div className="row">
              <div className="col-sm-4 col-lg-3 label">Title</div>
              <div className="col-sm-8 col-lg-9">{listing.title}</div>
            </div>
            <div className="row">
              <div className="col-sm-4 col-lg-3 label">Cagegory</div>
              <div className="col-sm-8 col-lg-9">
                <Category listing={listing} />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4 col-lg-3 label">Description</div>
              <div className="col-sm-8 col-lg-9">{listing.description}</div>
            </div>
            {isFractional ? null : (
              <div className="row">
                <div className="col-sm-4 col-lg-3 label">Listing Price</div>
                <div className="col-sm-8 col-lg-9">
                  <CoinPrice price={listing.price} coin="eth" />
                  <div className="fiat">
                    ~ <Price amount={listing.price} />
                  </div>
                </div>
              </div>
            )}
            {quantity <= 1 ? null : (
              <div className="row">
                <div className="col-sm-4 col-lg-3 label">Quantity</div>
                <div className="col-sm-8 col-lg-9">{listing.quantity}</div>
              </div>
            )}
            <div className="row">
              <div className="col-sm-4 col-lg-3 label">Boost Level</div>
              <div className="col-sm-8 col-lg-9">
                <CoinPrice price={boost} coin="ogn" />
                {isMulti ? ' / unit' : ''}
                {isFractional ? ' / night' : ''}
              </div>
            </div>
            {!isMulti && !isFractional ? null : (
              <div className="row">
                <div className="col-sm-4 col-lg-3 label">Boost Cap</div>
                <div className="col-sm-8 col-lg-9">
                  <CoinPrice price={listing.boostLimit} coin="ogn" />
                </div>
              </div>
            )}
            <div className="row">
              <div className="col-sm-4 col-lg-3 label">Photos</div>
              <div className="col-sm-8 col-lg-9">
                {listing.media.length ? (
                  <div className="photos">
                    {listing.media.map((image, idx) => (
                      <div
                        key={idx}
                        className="photo-row"
                        style={{ backgroundImage: `url(${image.urlExpanded})` }}
                      />
                    ))}
                  </div>
                ) : (
                  <i>No Photos</i>
                )}
              </div>
            </div>
            {!isFractional ? null : (
              <div className="row">
                <div className="col-sm-4 col-lg-3 label">Availability</div>
                <div className="col-sm-8 col-lg-9">
                  <Calendar
                    interactive={false}
                    small={true}
                    availability={
                      new AvailabilityCalculator({
                        weekdayPrice: listing.price,
                        weekendPrice: listing.weekendPrice,
                        booked: listing.booked,
                        unavailable: listing.unavailable,
                        customPricing: listing.customPricing
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="actions">
            <Link className="btn btn-outline-primary" to={`${prefix}/boost`}>
              Back
            </Link>
            {isEdit ? (
              <UpdateListing
                listing={this.props.listing}
                listingId={this.props.listingId}
                listingType={this.props.listingType}
                tokenBalance={this.props.tokenBalance}
                refetch={this.props.refetch}
                className="btn btn-primary"
                children="Done"
              />
            ) : (
              <CreateListing
                listing={this.props.listing}
                listingType={this.props.listingType}
                tokenBalance={this.props.tokenBalance}
                className="btn btn-primary"
                children="Done"
              />
            )}
          </div>
        </div>
        <div className="col-md-4">
          <Wallet />
          <div className="gray-box">
            <h5>What happens next?</h5>
            When you submit this listing, you will be asked to confirm your
            transaction in MetaMask. Buyers will then be able to see your
            listing and make offers on it.
          </div>
        </div>
      </div>
    )
  }
}

export default Review

require('react-styl')(`
  .create-listing .create-listing-review
    .fiat
      display: inline-block
      margin-left: 0.75rem
      font-size: 14px
    h2
      font-size: 28px
    .detail
      border: 1px solid var(--light)
      border-radius: var(--default-radius)
      padding: 1rem 2rem
      font-size: 18px
      font-weight: normal
      .row
        margin-bottom: 1rem
        .label
          color: var(--dusk)
    .photos
      margin-bottom: 1rem
      display: grid
      grid-column-gap: 10px;
      grid-row-gap: 10px;
      grid-template-columns: repeat(auto-fill,minmax(90px, 1fr));
      .photo-row
        font-size: 12px
        box-shadow: 0 0 0 0 rgba(19, 124, 189, 0), 0 0 0 0 rgba(19, 124, 189, 0), inset 0 0 0 1px rgba(16, 22, 26, 0.15), inset 0 1px 1px rgba(16, 22, 26, 0.2);
        background: #fff
        padding: 5px;
        background-position: center
        width: 100%
        height: 80px
        background-size: contain
        background-repeat: no-repeat

  @media (max-width: 767.98px)
    .create-listing .create-listing-review
      .detail
        padding: 1rem
`)
