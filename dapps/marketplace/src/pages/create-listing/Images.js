import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'

import Redirect from 'components/Redirect'
import Link from 'components/Link'
import ImagePicker from 'components/ImagePicker'

class ListingImages extends Component {
  constructor(props) {
    super(props)
    this.state = omit(props.listing, 'valid')
  }

  render() {
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }

    return (
      <>
        <h1>
          <Link to={this.props.prev} className="back d-md-none" />
          <fbt desc="createListing.addPhotos">Add Photos</fbt>
        </h1>
        <div className="step-description">
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
                this.validate()
              }}
            >
              {this.state.valid !== false ? null : (
                <div className="alert alert-danger">
                  <fbt desc="fix errors">Please fix the errors below...</fbt>
                </div>
              )}

              <div className="form-group">
                <ImagePicker
                  images={this.state.media}
                  onChange={media => this.setState({ media })}
                />
                <ul className="help-text photo-help list-unstyled">
                  <fbt desc="create.listing.photos.help">
                    <li>
                      Hold down &apos;command&apos; (⌘) to select multiple
                      images.
                    </li>
                    <li>Maximum 10 images per listing.</li>
                    <li>
                      First image will be featured - drag and drop images to
                      reorder.
                    </li>
                    <li>Recommended aspect ratio is 4:3</li>
                  </fbt>
                </ul>
              </div>

              <div className="actions">
                <Link
                  className="btn btn-outline-primary d-none d-md-inline-block"
                  to={this.props.prev}
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
                Be sure to give your listing an appropriate title and
                description to let others know what you&apos;re offering. Adding
                some photos will increase the chances of selling your listing.
              </fbt>
            </div>
          </div>
        </div>
      </>
    )
  }

  validate() {
    const newState = {}

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    if (!newState.valid) {
      window.scrollTo(0, 0)
    } else if (this.props.onChange) {
      this.props.onChange(this.state)
    }
    this.setState(newState)
    return newState.valid
  }
}

export default ListingImages

require('react-styl')(`
`)
