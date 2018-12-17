import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { PendingBadge, SoldBadge, FeaturedBadge } from 'components/badges'
import ListingCardPrices from 'components/listing-card-prices'

import { getListing } from 'utils/listing'
import { offerStatusToListingAvailability } from 'utils/offer'

import origin from '../services/origin'

class ListingCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      display: 'normal',
      offers: []
    }
  }

  async componentWillMount() {
    await this.loadListing()
    await this.loadOffers()
  }

  async loadListing() {
    try {
      const listing = await getListing(this.props.listingId, true)

      this.setState({
        // boostLevelIsPastSomeThreshold: listing.boostValue > 0,
        ...listing,
        loading: false
      })
    } catch (error) {
      console.error(
        `Error fetching contract or IPFS data for listing ${
          this.props.listingId
        }: ${error}`
      )
    }
  }

  async loadOffers() {
    try {
      const offers = await origin.marketplace.getOffers(this.props.listingId)
      this.setState({ offers })
    } catch (error) {
      console.error(
        `Error fetching offers for listing: ${this.props.listingId}`
      )
      console.error(error)
    }
  }

  render() {
    const {
      // boostLevelIsPastSomeThreshold,
      category,
      subCategory,
      loading,
      name,
      offers,
      pictures,
      price,
      status,
      unitsRemaining,
      listingType
    } = this.state
    const photo = pictures && pictures.length && pictures[0]
    const isPending = offers.find(
      o => offerStatusToListingAvailability(o.status) === 'pending'
    )
    const isSold = offers.find(
      o => offerStatusToListingAvailability(o.status) === 'sold'
    )
    const isWithdrawn = status === 'inactive'
    const showPendingBadge = isPending && !isWithdrawn && listingType !== 'fractional'
    const showSoldBadge = isSold || isWithdrawn && listingType !== 'fractional'
    const showFeaturedBadge = this.state.display == 'featured' && !showSoldBadge && !showPendingBadge

    return (
      <div
        className={`col-12 col-md-6 col-lg-4 listing-card${
          loading ? ' loading' : ''
        }`}
      >
        <Link
          to={`/listing/${this.props.listingId}`}
          ga-category="listing"
          ga-label="listing_card"
        >
          {!!photo && (
            <div
              className="photo"
              style={{ backgroundImage: `url("${photo}")` }}
            />
          )}
          {!photo && (
            <div className="image-container d-flex justify-content-center">
              <img src="images/default-image.svg" alt="camera icon" />
            </div>
          )}
          <div className="category placehold d-flex justify-content-between">
            <div>{category}&nbsp;&nbsp;|&nbsp;&nbsp;{subCategory}</div>
            {!loading && showPendingBadge && <PendingBadge />}
            {!loading && showSoldBadge && <SoldBadge />}
            {!loading && showFeaturedBadge && <FeaturedBadge />}
            {/*!loading &&
              boostLevelIsPastSomeThreshold && (
              <span
                className="boosted badge"
                title="Tell me <a href='https://originprotocol.com' target='_blank'>More</a> about what this means."
              >
                <img src="images/boost-icon-arrow.svg" role="presentation" />
              </span>
            )*/}
          </div>
          <h2 className="title placehold text-truncate" title={name}>{name}</h2>
          {price > 0 && (
            <ListingCardPrices price={price} unitsRemaining={unitsRemaining} />
          )}
        </Link>
      </div>
    )
  }
}

export default ListingCard
