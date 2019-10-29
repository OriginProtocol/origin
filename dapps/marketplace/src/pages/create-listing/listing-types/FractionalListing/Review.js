import React from 'react'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'

import { DEFAULT_GOOGLE_MAPS_API_KEY } from 'constants/config'
import LocationMap from 'components/LocationMap'
import Price from 'components/Price'
import GalleryScroll from 'components/GalleryScroll'
import Category from 'components/Category'
import FormattedDescription from 'components/FormattedDescription'

import Review from '../../Review'

const ReviewFractionalListing = props => {
  const listing = props.listing

  const renderMap = () => {
    let containerStyle = {
      height: '400px'
    }
    if (props.isMobile) {
      containerStyle = {
        ...containerStyle,
        marginLeft: '-30px',
        marginRight: '-30px'
      }
    }

    return (
      <LocationMap
        googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process
          .env.GOOGLE_MAPS_API_KEY || DEFAULT_GOOGLE_MAPS_API_KEY}`}
        loadingElement={<div style={{ height: '100%' }} />}
        containerElement={
          <div className="mt-3 mt-md-4" style={containerStyle} />
        }
        mapElement={<div style={{ height: '100%' }} />}
        defaultCenter={{
          latitude: listing.location.latitude,
          longitude: listing.location.longitude
        }}
        circleOptions={{
          latitude: listing.location.latitude,
          longitude: listing.location.longitude,
          radius: listing.location.accuracyInMeters
        }}
        readonly={true}
      />
    )
  }

  return (
    <Review {...props}>
      <div className="listing-review">
        <div className="title">{listing.title}</div>
        <div className="price-quantity">
          <div className="price">
            <Price
              listing={listing}
              target={listing.currency}
              descriptor
              price={{
                amount: listing.price,
                currency: { id: listing.currency }
              }}
            />
          </div>
        </div>
        <GalleryScroll pics={listing.media} />
        <div className="description">
          <FormattedDescription text={listing.description} />
        </div>
        <dl>
          <dt>
            <fbt desc="create.review.category">Category</fbt>
          </dt>
          <dd>
            <Category listing={listing} showPrimary={false} />
          </dd>
          <dt>
            <fbt desc="listing.review.weekends">Weekends</fbt>
          </dt>
          <dd>
            <Price
              listing={listing}
              target={listing.currency}
              descriptor
              price={{
                amount: listing.weekendPrice,
                currency: { id: listing.currency }
              }}
            />
          </dd>
          {listing.location && (
            <>
              <dt>
                <fbt desc="listing.review.location">Location</fbt>
              </dt>
              <dd>{renderMap()}</dd>
            </>
          )}
        </dl>
      </div>
    </Review>
  )
}

export default withIsMobile(ReviewFractionalListing)
