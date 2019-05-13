import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import withTokenBalance from 'hoc/withTokenBalance'
import withWallet from 'hoc/withWallet'

import Wallet from 'components/Wallet'
import Price from 'components/Price'
import CoinPrice from 'components/CoinPrice'
import Category from 'components/Category'
import Link from 'components/Link'
import FormattedDescription from 'components/FormattedDescription'
import countryCodeMapping from '@origin/graphql/src/constants/CountryCodes'
import { CurrenciesByCountryCode } from 'constants/Currencies'
import { GiftCardRetailers } from 'constants/GiftCardRetailers'

import CreateListing from '../../mutations/CreateListing'
import UpdateListing from '../../mutations/UpdateListing'

import withConfig from 'hoc/withConfig'

class Review extends Component {
  state = {}
  listing = {}

  // Add properties that are wholely derived from others
  addDerivedProps(listing) {
    const currencySymbol =
      CurrenciesByCountryCode[this.props.listing.issuingCountry][2]
    listing.title = `${currencySymbol}${this.props.listing.cardAmount} ${
      this.props.listing.retailer
    } Gift Card`
    // Construct gift card image entry
    const { ipfsGateway } = this.props.config
    const giftCardHash = GiftCardRetailers[listing.retailer]
    const giftCardImageIpfsUri = `ipfs://${giftCardHash}`
    const giftCardImageExpandededUri = `${ipfsGateway}/ipfs/${giftCardHash}`
    const giftCardEntry = {
      url: giftCardImageIpfsUri,
      urlExpanded: giftCardImageExpandededUri,
      contentType: 'image/jpeg'
    }
    // Remove existing gift card image if it's there
    listing.media = listing.media.filter(e => e.url != giftCardImageIpfsUri)
    // Add it in front position
    listing.media.unshift(giftCardEntry)

    return listing
  }

  render() {
    if (!this.props.config) return null

    const { ipfsGateway } = this.props.config

    const listing = this.addDerivedProps(this.props.listing)
    const tokenBalance = this.props.tokenBalance
    const quantity = Number(listing.quantity || 0)
    const isMulti = quantity > 1
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
                <fbt desc="create.review.category">Category</fbt>
              </div>
              <div className="col-9">
                <Category listing={listing} />
              </div>
            </div>

            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.review.giftcard.retailer">Retailer</fbt>
              </div>
              <div className="col-9">{listing.retailer}</div>
            </div>

            <div className="giftcard-image">
              <img
                src={
                  listing.retailer
                    ? `${ipfsGateway}/ipfs/${
                        GiftCardRetailers[listing.retailer]
                      }`
                    : `${ipfsGateway}/ipfs/QmVffY9nUZYPt8uBy1ra9aMvixc1NC6jT7JjFNUgsuqbpJ`
                }
              />
            </div>

            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.review.giftcard.issuingCountry">
                  Issuing Country
                </fbt>
              </div>
              <div className="col-9 d-flex">
                <img
                  className="country-flag-img"
                  src={`images/flags/${listing.issuingCountry.toLowerCase()}.svg`}
                />

                <div style={{ flex: 1 }}>
                  {countryCodeMapping['en'][listing.issuingCountry]}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.details.giftcard.isDigital">Card type</fbt>
              </div>
              <div className="col-9">
                {listing.isDigital ? (
                  <fbt desc="digital">Digital</fbt>
                ) : (
                  <fbt desc="physical">Physical</fbt>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.details.giftcard.isCashPurchase">
                  Was this a cash purchase?
                </fbt>
              </div>
              <div className="col-9">
                {listing.isCashPurchase ? (
                  <fbt desc="yes">Yes</fbt>
                ) : (
                  <fbt desc="no">No</fbt>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.details.giftcard.receiptAvailable">
                  Is a receipt available?
                </fbt>
              </div>
              <div className="col-9">
                {listing.receiptAvailable ? (
                  <fbt desc="yes">Yes</fbt>
                ) : (
                  <fbt desc="no">No</fbt>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.review.giftcards.notes">Notes</fbt>
              </div>
              <div className="col-9">
                <FormattedDescription text={listing.description} />
              </div>
            </div>
            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.review.price">Listing Price</fbt>
              </div>
              <div className="col-9">
                <Price
                  target={listing.currency}
                  price={{
                    amount: listing.price,
                    currency: { id: listing.currency }
                  }}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-3 label">
                <fbt desc="create.review.giftcard.cardAmount">
                  Amount on Card
                </fbt>
              </div>
              <div className="col-9">
                {CurrenciesByCountryCode[listing.issuingCountry][2]}
                {listing.cardAmount}
              </div>
            </div>

            {quantity <= 1 ? null : (
              <div className="row">
                <div className="col-3 label">
                  <fbt desc="create.review.quantity">Quantity</fbt>
                </div>
                <div className="col-9">{listing.quantity}</div>
              </div>
            )}
            <div className="row">
              <div className="col-3 label">
                <fbt desc="listing.review.boost-level">Boost Level</fbt>
              </div>
              <div className="col-9">
                <CoinPrice price={boost} coin="ogn" />
                {isMulti ? fbt(' / unit', 'per unit') : ''}
              </div>
            </div>
            {!isMulti ? null : (
              <div className="row">
                <div className="col-3 label">
                  <fbt desc="create.review.unit.boostLimit">Boost Cap</fbt>
                </div>
                <div className="col-9">
                  <CoinPrice price={listing.boostLimit} coin="ogn" />
                </div>
              </div>
            )}
            {listing.media.length <= 1 ? null : (
              <div className="row">
                <div className="col-3 label">
                  <fbt desc="create.review.photos">Photos</fbt>
                </div>
                <div className="col-9">
                  <div className="photos">
                    {listing.media.slice(1).map((image, idx) => (
                      <div
                        key={idx}
                        className="photo-row"
                        style={{ backgroundImage: `url(${image.urlExpanded})` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="actions">
            <Link className="btn btn-outline-primary" to={this.props.prev}>
              <fbt desc="back">Back</fbt>
            </Link>
            {listing.id ? (
              <UpdateListing
                listing={listing}
                tokenBalance={this.props.tokenBalance}
                refetch={this.props.refetch}
                className="btn btn-primary"
                children={fbt('Done', 'Done')}
              />
            ) : (
              <CreateListing
                listing={listing}
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

export default withWallet(withTokenBalance(withConfig(Review)))

require('react-styl')(`
    .country-flag-img
      width: 2rem
      height: 2rem
      margin-right: .5rem;
`)
