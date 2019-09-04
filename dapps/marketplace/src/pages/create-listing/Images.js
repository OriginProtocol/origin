import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'

import Redirect from 'components/Redirect'
import Link from 'components/Link'
import ImagePicker from 'components/ImagePicker'

const ListingImages = ({ prev, next, listing, onChange, isMobile }) => {
  const [redirect, setRedirect] = useState(false)
  const [media, setMedia] = useState(listing.media)
  if (redirect) {
    return <Redirect to={next} push />
  }

  return (
    <>
      <h1>
        <Link to={prev} className="back d-md-none" />
        <fbt desc="createListing.addPhotos">Add Photos</fbt>
      </h1>
      <div className="step-description mb-0">
        <fbt desc="createListing.addPhotosDescription">
          Listings with photos will get 5x more exposure in Origin Marketplace
        </fbt>
      </div>
      <div className="row">
        <div className="col-md-8">
          <form
            className="listing-step"
            onSubmit={e => {
              e.preventDefault()
              onChange({ ...listing, media })
              setRedirect(true)
            }}
          >
            <div className="form-group">
              <ImagePicker images={media} onChange={media => setMedia(media)} />
              <ul className="help-text photo-help list-unstyled">
                {isMobile ? (
                  <fbt desc="create.listing.photos.helpMobile">
                    <li>First image will be featured</li>
                    <li>Recommended aspect ratio is 4:3</li>
                  </fbt>
                ) : (
                  <fbt desc="create.listing.photos.help">
                    <li>
                      Hold down &apos;command&apos; (⌘) to select multiple
                      images
                    </li>
                    <li>
                      First image will be featured
                    </li>
                    <li>
                      Drag and drop to reorder
                    </li>
                    <li>Recommended aspect ratio is 4:3</li>
                  </fbt>
                )}
              </ul>
            </div>

            <div className="actions">
              <Link
                className="btn btn-outline-primary d-none d-md-inline-block"
                to={prev}
              >
                <fbt desc="back">Back</fbt>
              </Link>
              <button type="submit" className="btn btn-primary">
                <fbt desc="continue">Continue</fbt>
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-4 d-none d-md-block">
          <div className="gray-box">
            <fbt desc="create.details.help">
              <h5>Add Listing Details</h5>
              Be sure to give your listing an appropriate title and description
              to let others know what you&apos;re offering. Adding some photos
              will increase the chances of selling your listing.
            </fbt>
          </div>
        </div>
      </div>
    </>
  )
}

export default withIsMobile(ListingImages)

require('react-styl')(`
`)
