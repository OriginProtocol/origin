import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { PendingBadge, SoldBadge, FeaturedBadge } from 'components/badges'
import ListingCardPrices from 'components/listing-card-prices'

import { getListing, getDerivedListingData } from 'utils/listing'

class ListingCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      listing: {
        display: 'normal',
        offers: []
      }
    }
  }

  async componentWillMount() {
    await this.loadListing()
  }

  async loadListing() {
    try {
      const listing = await getListing(this.props.listingId, { translate: true, loadOffers: true })

      this.setState({
        // boostLevelIsPastSomeThreshold: listing.boostValue > 0,
        listing,
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

  render() {
    const {
      listing,
      loading
    } = this.state

    const {
      category,
      subCategory,
      name,
      pictures,
      price,
      isMultiUnit,
      unitsRemaining,
      isFractional
    } = listing

    const photo = pictures && pictures.length && pictures[0]

    const {
      showPendingBadge,
      showSoldBadge,
      showFeaturedBadge,
      averagePrice
    } = getDerivedListingData(listing)

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
            {!loading && showSoldBadge && <SoldBadge isMultiUnit={isMultiUnit} />}
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
          {(price > 0 || averagePrice > 0) && (
            <ListingCardPrices
              price={isFractional ? averagePrice : price}
              unitsRemaining={unitsRemaining}
              isMultiUnit={isMultiUnit}
              isFractional={isFractional}
            />
          )}
        </Link>
      </div>
    )
  }
}

export default ListingCard
