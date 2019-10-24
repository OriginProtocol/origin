import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'

import Redirect from 'components/Redirect'
import Link from 'components/Link'
import Geocode from 'react-geocode'
import { formFeedback } from 'utils/formHelpers'

const ListingLocation = ({ prev, next, listing, onChange, isMobile }) => {
  const [redirect, setRedirect] = useState(false)
  const [location, setLocation] = useState(null)
  const [fetchingLocation, setFetchingLocation] = useState(false)
  const [formLocationValue, setFormLocationValue] = useState('')
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
  const Feedback = formFeedback(formLocationValue)

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

  const fetchCurrentLocation = async (e) => {
    e.preventDefault()
    setFetchingLocation(true)
    setCurrentLocationError(null)

    // TODO add some fetching location spinner that times out
    if (window.webViewBridge) {
      if (window.webViewBridge.send) {
        const onSuccess = (data) => { 
          if (data.locationAvailable) {
            saveLocation(data.position.coords.latitude, data.position.coords.longitude)
          } else {
            setCurrentLocationError(data.error)
          }
        }

        window.webViewBridge.send('getCurrentPosition', null, onSuccess)
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        saveLocation(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        setCurrentLocationError(error.message)
        setFetchingLocation(false)
      })
    }
  }

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
              if (!location) {
                //TODO put this into config 
                Geocode.setApiKey('AIzaSyCIWC3x1Xn5lDGRDLvI1O9vAyIjoJRCsg0')
                Geocode.enableDebug()
                console.log("11111")
                Geocode.fromAddress(formLocationValue).then(
                  response => {
                    console.log("111112")
                    const { lat, lng } = response.results[0].geometry.location
                    saveLocation(lat, lng)
                  },
                  error => {
                    console.log("11113")
                    setFormLocationError(error.message)
                    console.error(error.message)
                  }
                )
              } else {
                saveLocation(location.latitude, location.longitude)
              }
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
                className="btn btn-outline-primary btn-location"
                onClick={fetchCurrentLocation}
              >
                {!fetchingLocation && <fbt desc="createListing.useCurrentLocation">Use current location</fbt>}
                {fetchingLocation && <fbt desc="createListing.fetchingLocation">Fetching location</fbt>}
              </button>
              {currentLocationError && <div className="invalid-feedback d-flex justify-content-center mt-3">
                {currentLocationError}
              </div>}
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
