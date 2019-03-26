import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import withTokenBalance from 'hoc/withTokenBalance'

import Wallet from 'components/Wallet'
import Price from 'components/Price'
import CoinPrice from 'components/CoinPrice'
import Category from 'components/Category'
import Link from 'components/Link'
import FormattedDescription from 'components/FormattedDescription'

import CreateListing from '../../mutations/CreateListing'
import UpdateListing from '../../mutations/UpdateListing'

class Review extends Component {
  state = {}
  render() {
    const { listing, tokenBalance } = this.props
    const quantity = Number(listing.quantity || 0)
    const isMulti = quantity > 1
    const boost = tokenBalance >= Number(listing.boost) ? listing.boost : '0'

    return (
      <div className="row create-listing-review">
        <div className="col-md-8">
          <h2>Review your listing</h2>

          <div className="detail">
            <div className="row">
              <div className="col-3 label">Title</div>
              <div className="col-9">{listing.title}</div>
            </div>
            <div className="row">
              <div className="col-3 label">Cagegory</div>
              <div className="col-9">
                <Category listing={listing} />
              </div>
            </div>
            <div className="row">
              <div className="col-3 label">Description</div>
              <div className="col-9">
                <FormattedDescription text={listing.description} />
              </div>
            </div>
            <div className="row">
              <div className="col-3 label">Listing Price</div>
              <div className="col-9">
                <CoinPrice price={listing.price} coin="eth" />
                <div className="fiat">
                  ~ <Price amount={listing.price} />
                </div>
              </div>
            </div>
            {quantity <= 1 ? null : (
              <div className="row">
                <div className="col-3 label">Quantity</div>
                <div className="col-9">{listing.quantity}</div>
              </div>
            )}
            <div className="row">
              <div className="col-3 label">Boost Level</div>
              <div className="col-9">
                <CoinPrice price={boost} coin="ogn" />
                {isMulti ? ' / unit' : ''}
              </div>
            </div>
            {!isMulti ? null : (
              <div className="row">
                <div className="col-3 label">Boost Cap</div>
                <div className="col-9">
                  <CoinPrice price={listing.boostLimit} coin="ogn" />
                </div>
              </div>
            )}
            <div className="row">
              <div className="col-3 label">Photos</div>
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
                  <i>No Photos</i>
                )}
              </div>
            </div>
          </div>

          <div className="actions">
            <Link className="btn btn-outline-primary" to={this.props.prev}>
              Back
            </Link>
            {listing.id ? (
              <UpdateListing
                listing={listing}
                tokenBalance={this.props.tokenBalance}
                refetch={this.props.refetch}
                className="btn btn-primary"
                children="Done"
              />
            ) : (
              <CreateListing
                listing={listing}
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

export default withTokenBalance(Review)
