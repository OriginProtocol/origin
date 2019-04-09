import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import AvailabilityCalculator from '@origin/graphql/src/utils/AvailabilityCalculator'

import withTokenBalance from 'hoc/withTokenBalance'

import Wallet from 'components/Wallet'
import Price from 'components/Price'
import CoinPrice from 'components/CoinPrice'
import Calendar from 'components/Calendar'
import Category from 'components/Category'
import Link from 'components/Link'
import FormattedDescription from 'components/FormattedDescription'

import CreateListing from '../../mutations/CreateListing'
import UpdateListing from '../../mutations/UpdateListing'

class Review extends Component {
  state = {}
  render() {
    const { listing, tokenBalance } = this.props
    const boost = tokenBalance >= Number(listing.boost) ? listing.boost : '0'

    return (
      <div className="row create-listing-review">
        <div className="col-md-8">
          <h2>
            <fbt desc="creation.review.main-title">Review your listing</fbt>
          </h2>

          <div className="detail">
            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.review.title">Title</fbt>
              </div>
              <div className="col-9">{listing.title}</div>
            </div>
            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.review.category">Category</fbt>
              </div>
              <div className="col-9">
                <Category listing={listing} />
              </div>
            </div>
            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.review.description">Description</fbt>
              </div>
              <div className="col-9">
                <FormattedDescription text={listing.description} />
              </div>
            </div>
            <div className="row">
              <div className="col-3 label">
                <fbt desc="listing.review.weekdays">Weekdays</fbt>
              </div>
              <div className="col-9">
                <Price
                  target={listing.currency}
                  price={{
                    amount: listing.price,
                    currency: listing.currency
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-3 label">
                <fbt desc="listing.review.weekends">Weekends</fbt>
              </div>
              <div className="col-9">
                <Price
                  target={listing.currency}
                  price={{
                    amount: listing.weekendPrice,
                    currency: listing.currency
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-3 label">
                <fbt desc="listing.review.boost-level">Boost Level</fbt>
              </div>
              <div className="col-9">
                <CoinPrice price={boost} coin="ogn" />
                <fbt desc="create.review.price-per-hour">/ night</fbt>
              </div>
            </div>
            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.review.photos">Photos</fbt>
              </div>
              <div className="col-9">
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
                  <i>
                    <fbt desc="create.review.no photos">No Photos</fbt>
                  </i>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.hourly.availability">Availability</fbt>
              </div>
              <div className="col-9">
                <Calendar
                  interactive={false}
                  small={true}
                  currency={listing.currency}
                  originalCurrency
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
          </div>

          <div className="actions">
            <Link className="btn btn-outline-primary" to={this.props.prev}>
              <fbt desc="back">Back</fbt>
            </Link>
            {this.props.listing.id ? (
              <UpdateListing
                listing={this.props.listing}
                tokenBalance={this.props.tokenBalance}
                refetch={this.props.refetch}
                className="btn btn-primary"
                children={fbt('Done', 'Done')}
              />
            ) : (
              <CreateListing
                listing={this.props.listing}
                tokenBalance={this.props.tokenBalance}
                className="btn btn-primary"
                children={fbt('Done', 'Done')}
              />
            )}
          </div>
        </div>
        <div className="col-md-4">
          <Wallet />
          <div className="gray-box">
            <fbt desc="create.review.What happens next">
              <h5>What happens next?</h5>
              When you submit this listing, you will be asked to confirm your
              transaction in MetaMask. Buyers will then be able to see your
              listing and make offers on it.
            </fbt>
          </div>
        </div>
      </div>
    )
  }
}

export default withTokenBalance(Review)
