import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'
import Geocode from 'react-geocode'

import withIsMobile from 'hoc/withIsMobile'

import Redirect from 'components/Redirect'
import { DEFAULT_GOOGLE_MAPS_API_KEY } from 'constants/config'
import Link from 'components/Link'
import LocationMap from 'components/LocationMap'

const ListingLocation = ({ prev, next, listing, onChange, isMobile }) => {
  const isEditingListing = /\/edit\//.test(location.href)
  const [redirect, setRedirect] = useState(false)
  const [fetchingLocation, setFetchingLocation] = useState(false)
  const [forceEditLocation, setForceEditLocation] = useState(false)
  const [formLocationValue, setFormLocationValue] = useState(
    listing.locationAddress || ''
  )
  const [formLocationError, setFormLocationError] = useState(null)
  const [currentLocationError, setCurrentLocationError] = useState(null)

  const locationInput = () => {
    let className = 'px-3'
    if (formLocationError) {
      className += ' is-invalid'
    }

    return {
      value: formLocationValue,
      className,
      name: 'location',
      onChange: e => {
        setFormLocationValue(e.target.value)
        setFormLocationError(null)
      }
    }
  }

  const input = locationInput()

  if (redirect) {
    return <Redirect to={next} push />
  }

  const saveLocation = (latitude, longitude) => {
    listing.exactLocation = {
      latitude,
      longitude
    }
    onChange({ ...listing })
    setFetchingLocation(false)
    setCurrentLocationError(null)
    setRedirect(true)
  }

  const fetchCurrentLocation = async e => {
    e.preventDefault()
    setFetchingLocation(true)
    setCurrentLocationError(null)

    if (window.webViewBridge) {
      if (window.webViewBridge.send) {
        const onSuccess = data => {
          if (data.locationAvailable) {
            saveLocation(
              data.position.coords.latitude,
              data.position.coords.longitude
            )
          } else {
            setCurrentLocationError(data.error)
          }
        }

        window.webViewBridge.send('getCurrentPosition', null, onSuccess)
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          saveLocation(position.coords.latitude, position.coords.longitude)
        },
        error => {
          setCurrentLocationError(error.message)
          setFetchingLocation(false)
        }
      )
    }
  }

  const renderExistingLocationMap = () => {
    let containerStyle = {
      height: '400px'
    }
    if (isMobile) {
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

  const renderExistingLocation = () => {
    return (
      <>
        <h1>
          <Link to={prev} className="back d-md-none" />
          <fbt desc="createListing.listingLocation">Listing Location</fbt>
        </h1>
        <div className="step-description mb-0">
          <fbt desc="createListing.existingListingLocation">
            This is the location currently set on the listing.
          </fbt>
        </div>
        <div className="row location-obfuscation-map">
          <div className="listing-step">
            <div className="col-md-8 px-0 px-md-3">
              <div className="form-group">{renderExistingLocationMap()}</div>
            </div>
            <div className="actions mt-auto">
              <button
                className="btn btn-outline-primary mb-3"
                onClick={() => {
                  delete listing.location
                  setForceEditLocation(true)
                }}
              >
                <fbt desc="editListing.editLocation">Edit location</fbt>
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  listing.skipLocationObfuscationForward = true
                  onChange({ ...listing })
                  setRedirect(true)
                }}
              >
                <fbt desc="editListing.useCurrentLocation">
                  Use current location
                </fbt>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const renderInputLocation = () => {
    return (
      <>
        <h1>
          <Link to={prev} className="back d-md-none" />
          <fbt desc="createListing.listingLocation">Listing Location</fbt>
        </h1>
        <div className="step-description mb-0 px-4 px-md-0">
          <fbt desc="createListing.whereIsListingLocated">
            Where is your listing located?
          </fbt>
        </div>
        <div className="row location">
          <div className="col-md-8">
            <form
              className="listing-step"
              onSubmit={e => {
                e.preventDefault()
                Geocode.setApiKey(
                  process.env.GOOGLE_MAPS_API_KEY || DEFAULT_GOOGLE_MAPS_API_KEY
                )
                Geocode.enableDebug()
                listing.locationAddress = formLocationValue
                Geocode.fromAddress(formLocationValue).then(
                  response => {
                    const { lat, lng } = response.results[0].geometry.location
                    saveLocation(lat, lng)
                  },
                  error => {
                    setFormLocationError(error.message)
                    console.error(error.message)
                  }
                )
              }}
            >
              <div className="form-group">
                <input
                  {...input}
                  placeholder={fbt(
                    '123 Main St.',
                    'createListing.locationPlaceholder'
                  )}
                />
                <button
                  className={`btn btn-outline-primary btn-location d-flex align-items-center justify-content-center`}
                  onClick={fetchCurrentLocation}
                >
                  {!fetchingLocation && (
                    <>
                      <img className="mr-2" src="images/location-icon.svg" />
                      <div>
                        <fbt desc="createListing.useCurrentLocation">
                          Use current location
                        </fbt>
                      </div>
                    </>
                  )}
                  {fetchingLocation && (
                    <fbt desc="createListing.fetchingLocation">
                      Fetching location
                    </fbt>
                  )}
                </button>
                {currentLocationError && (
                  <div className="invalid-feedback d-flex justify-content-center mt-3">
                    {currentLocationError}
                  </div>
                )}
              </div>

              <div className="actions mt-auto">
                <button type="submit" className="btn btn-primary">
                  <fbt desc="next">Next</fbt>
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    )
  }

  return listing.location && isEditingListing && !forceEditLocation
    ? renderExistingLocation()
    : renderInputLocation()
}

export default withIsMobile(ListingLocation)

require('react-styl')(`
  .location
    height: 100%
    .listing-step
      height: 100%
      input
        min-height: 50px
        border-radius: 5px
        border: solid 1px #c2cbd3
        &.lat-lng-location
          text-align: center
          color: var(--clear-blue)
          border: solid 1px var(--clear-blue)
          font-weight: 600
    .btn-location
      min-height: 50px
      margin-top: 20px
      border-radius: 30px
`)
