import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import $ from 'jquery'

import ListingCardPrices from 'components/listing-card-prices'

import { getListing } from 'utils/listing'

import origin from '../services/origin'

class ListingCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      offers: []
    }
  }

  async componentWillMount() {
    await this.loadListing()
    await this.loadOffers()
  }

  // componentDidUpdate(prevProps, prevState) {
  //   // init tooltip only when necessary
  //   if (this.state.boostLevelIsPastSomeThreshold && !prevState.id) {
  //     $('[data-toggle="tooltip"]').tooltip({
  //       delay: { hide: 1000 },
  //       html: true
  //     })
  //   }
  // }

  componentWillUnmount() {
    $('[data-toggle="tooltip"]').tooltip('dispose')
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
      loading,
      name,
      offers,
      pictures,
      price,
      unitsRemaining
    } = this.state
    const photo = pictures && pictures.length && pictures[0]
    const pendingStates = ['created', 'accepted', 'disputed']
    const isPending = offers.find(o => pendingStates.includes(o.status))
    const soldStates = ['finalized', 'sellerReviewed']
    const isSold = offers.find(o => soldStates.includes(o.status))

    return (
      <div
        className={`col-12 col-md-6 col-lg-4 listing-card${
          loading ? ' loading' : ''
        }`}
      >
        <Link to={`/listing/${this.props.listingId}`}>
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
            <div>{category}</div>
            {!loading &&
              isPending && (
              <span className="pending badge">
                <FormattedMessage
                  id={'listing-card.pending'}
                  defaultMessage={'Pending'}
                />
              </span>
            )}
            {!loading &&
              isSold && (
              <span className="sold badge">
                <FormattedMessage
                  id={'listing-card.sold'}
                  defaultMessage={'Sold Out'}
                />
              </span>
            )}
            {/*!loading &&
              boostLevelIsPastSomeThreshold && (
              <span
                className="boosted badge"
                data-toggle="tooltip"
                title="Tell me <a href='https://originprotocol.com' target='_blank'>More</a> about what this means."
              >
                <img src="images/boost-icon-arrow.svg" role="presentation" />
              </span>
            )*/}
          </div>
          <h2 className="title placehold text-truncate">{name}</h2>
          {price > 0 && (
            <ListingCardPrices price={price} unitsRemaining={unitsRemaining} />
          )}
        </Link>
      </div>
    )
  }
}

export default ListingCard
