import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import { DEFAULT_GOOGLE_MAPS_API_KEY } from 'constants/config'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import LocationMap from 'components/LocationMap'

const LocationObfuscation = ({ prev, next, listing, onChange }) => {
  const defaultZoom = 16
  /* Zoom level goes from 1 - 20 where 1 is the whole world and each level up to
   * 20 doubles the previous zoom.
   */
  const getCircleRadius = zoomLevel => {
    // if 30 is changed, it should also be changed in circleRadiusToZoom in LocationMap component
    const minRadius = 30
    return Math.pow(2, 20 - zoomLevel - 1) * minRadius
  }

  const [redirect, setRedirect] = useState(false)
  const [map, setMap] = useState(null)
  const [circleCenter, setCircleCenter] = useState({
    lat: listing.exactLocation.latitude,
    lng: listing.exactLocation.longitude
  })
  const [circleRadius, setCircleRadius] = useState(getCircleRadius(defaultZoom))

  const onMapMonted = ref => {
    setMap(ref)
  }
  const recalculateCircle = () => {
    setCircleCenter({
      lat: map.getCenter().lat(),
      lng: map.getCenter().lng()
    })

    setCircleRadius(getCircleRadius(map.getZoom()))
  }

  if (listing.skipLocationObfuscationBackward) {
    delete listing.skipLocationObfuscationBackward
    onChange({ ...listing })
    return <Redirect to={prev} push />
  }

  if (redirect || listing.skipLocationObfuscationForward) {
    delete listing.skipLocationObfuscationForward
    onChange({ ...listing })
    return <Redirect to={next} push />
  }

  return (
    <>
      <h1>
        <Link
          onClick={() => {
            delete listing.exactLocation
          }}
          to={prev}
          className="back d-md-none"
        />
        <fbt desc="createListing.listingLocation">Listing Location</fbt>
      </h1>
      <div className="step-description mb-0">
        <fbt desc="createListing.listingAccuracy">
          This is what will be shown to potential guests. Adjust the map so that
          your listing is located within the circle. For your privacy, don’t
          make it too precise.
        </fbt>
      </div>
      <div className="row location-obfuscation-map">
        <div className="col-md-8 px-0 px-md-3">
          <form
            className="listing-step location px-0 px-md-4"
            onSubmit={e => {
              e.preventDefault()
              listing.location = {
                latitude: circleCenter.lat,
                longitude: circleCenter.lng,
                accuracyInMeters: circleRadius
              }

              onChange({ ...listing })
              setRedirect(true)
            }}
          >
            <div className="form-group">
              <LocationMap
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process
                  .env.GOOGLE_MAPS_API_KEY || DEFAULT_GOOGLE_MAPS_API_KEY}`}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={
                  <div style={{ height: '50vh', maxHeight: '400px' }} />
                }
                mapElement={<div style={{ height: `100%` }} />}
                onMapMonted={onMapMonted}
                recalculateCircle={recalculateCircle}
                circleCenter={circleCenter}
                defaultZoom={defaultZoom}
                markerOptions={{
                  latitude: listing.exactLocation.latitude,
                  longitude: listing.exactLocation.longitude
                }}
                defaultCenter={{
                  latitude: listing.exactLocation.latitude,
                  longitude: listing.exactLocation.longitude
                }}
                circleOptions={{
                  latitude: circleCenter.lat,
                  longitude: circleCenter.lng,
                  radius: circleRadius
                }}
              />
            </div>
            <div className="actions mt-auto px-3 px-md-0">
              <button type="submit" className="btn btn-primary">
                <fbt desc="Continue">Continue</fbt>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default LocationObfuscation

require('react-styl')(`
  .create-listing
    .location-obfuscation-map
      height: 100%

  @media (min-width: 767.98px)
    .create-listing
      .location-obfuscation-map
        .listing-step.location
          .form-group
            max-width: 100%

`)
