import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import ListingCardPrices from 'components/listing-card-prices'

import { translateListingCategory } from 'utils/translationUtils'

import origin from '../services/origin'

class ListingCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      shouldRender: true
    }
  }

  async componentDidMount() {
    try {
      const rawListing = await origin.marketplace.getListing(
        this.props.listingId
      )
      const listing = rawListing.ipfsData.data
      const translatedListing = translateListingCategory(listing)
      if (!this.props.hideList.includes(this.props.listingId)) {
        const obj = Object.assign({}, translatedListing, { loading: false })

        this.setState(obj)
      } else {
        this.setState({ shouldRender: false })
      }
    } catch (error) {
      console.error(
        `Error fetching contract or IPFS info for listingId: ${
          this.props.listingId
        }`
      )
    }
  }

  render() {
    const {
      category,
      loading,
      name,
      pictures,
      price,
      unitsAvailable,
      shouldRender
    } = this.state
    const photo = pictures && pictures.length && pictures[0]

    if (!shouldRender) return false

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
            {!loading && (
              <div>
                {this.props.listingId < 5 && (
                  <span className="featured badge">
                    <FormattedMessage
                      id={'listing-card.featured'}
                      defaultMessage={'Featured'}
                    />
                  </span>
                )}
              </div>
            )}
          </div>
          <h2 className="title placehold text-truncate">{name}</h2>
          {price > 0 && (
            <ListingCardPrices price={price} unitsAvailable={unitsAvailable} />
          )}
        </Link>
      </div>
    )
  }
}

export default ListingCard
