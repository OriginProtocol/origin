import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import $ from 'jquery'

import ListingCardPrices from 'components/listing-card-prices'

import { translateListingCategory } from 'utils/translationUtils'

import origin from '../services/origin'

class ListingCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  async componentDidMount() {
    try {
      const rawListing = await origin.marketplace.getListing(
        this.props.listingId
      )
      const listing = rawListing.ipfsData.data
      const translatedListing = translateListingCategory(listing)

      this.setState({
        boostLevelIsPastSomeThreshold: !!Math.round(Math.random()),
        ...rawListing,
        ...translatedListing,
        loading: false
      })
    } catch (error) {
      console.error(
        `Error fetching contract or IPFS info for listingId: ${
          this.props.listingId
        }`
      )
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // init tooltip only when necessary
    if (this.state.boostLevelIsPastSomeThreshold && !prevState.id) {
      $('[data-toggle="tooltip"]').tooltip({
        delay: { hide: 1000 },
        html: true
      })
    }
  }

  render() {
    const {
      boostLevelIsPastSomeThreshold,
      category,
      loading,
      name,
      pictures,
      price,
      unitsAvailable
    } = this.state
    const photo = pictures && pictures.length && pictures[0]

    return (
      <div
        className={`col-12 col-md-6 col-lg-4 listing-card${
          loading ? ' loading' : ''
        }`}
      >
        <Link to={`/listing/${this.props.listingId}`}>
          {!!photo &&
            <div
              className="photo"
              style={{ backgroundImage: `url("${photo}")` }}
            />
          }
          {!photo &&
            <div className="image-container d-flex justify-content-center">
              <img src="images/default-image.svg" alt="camera icon" />
            </div>
          }
          <div className="category placehold d-flex justify-content-between">
            <div>{category}</div>
            {!loading && unitsAvailable === 0 &&
              <span className="sold badge">
                <FormattedMessage
                  id={'listing-card.sold'}
                  defaultMessage={'Sold Out'}
                />
              </span>
            }
            {!loading && boostLevelIsPastSomeThreshold &&
              <span
                className="boosted badge"
                data-toggle="tooltip"
                title="Tell me <a href='https://originprotocol.com' target='_blank'>More</a> about what this means."
              >Boosted</span>
            }
          </div>
          <h2 className="title placehold text-truncate">{name}</h2>
          {price > 0 &&
            <ListingCardPrices price={price} unitsAvailable={unitsAvailable} />
          }
        </Link>
      </div>
    )
  }
}

export default ListingCard
