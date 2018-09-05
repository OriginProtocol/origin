import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import ListingCardPrices from 'components/listing-card-prices'

import { getListing } from 'utils/listing'

class ListingCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  async componentDidMount() {
    try {
      const listing = await getListing(this.props.listingId, true)

      this.setState({
        ...listing,
        loading: false
      })
    } catch (error) {
      console.error(
        `Error fetching contract or IPFS data for listing ${this.props.listingId}: ${error}`
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
      unitsRemaining
    } = this.state
    const photo = pictures && pictures.length && pictures[0]

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
            <ListingCardPrices price={price} unitsRemaining={unitsRemaining} />
          )}
        </Link>
      </div>
    )
  }
}

export default ListingCard
