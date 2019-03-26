import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'

import Steps from 'components/Steps'
import Wallet from 'components/Wallet'
import ImagePicker from 'components/ImagePicker'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import { formInput, formFeedback } from 'utils/formHelpers'

class Details extends Component {
  constructor(props) {
    super(props)
    this.state = omit(props.listing, 'valid')
  }

  componentDidMount() {
    if (this.titleInput) {
      this.titleInput.focus()
    }
  }

  render() {
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing-step-2">
            <div className="wrap">
              <div className="step">
                <fbt desc="create.details.step">
                  Step
                  <fbt:param name="step">{this.props.step}</fbt:param>
                </fbt>
              </div>
              <div className="step-description"><fbt desc="create.details.title">
                Provide listing details
              </fbt></div>
              <Steps steps={this.props.steps} step={this.props.step} />

              <form
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
                  <label>
                    <fbt desc="create.Title">Title</fbt>
                  </label>
                  <input {...input('title')} ref={r => (this.titleInput = r)} />
                  {Feedback('title')}
                </div>
                <div className="form-group">
                  <label className="mb-0">
                    <fbt desc="create.Description">Description</fbt>
                  </label>
                  <textarea {...input('description')} />
                  {Feedback('description')}
                </div>

                {/* Listing specific fields go here, but Announcements have none. */}

                <div className="form-group">
                  <label>
                    <fbt desc="create.Select photos">Select photos</fbt>
                  </label>
                  <ImagePicker
                    images={this.state.media}
                    onChange={media => this.setState({ media })}
                  >
                    <div className="add-photos">
                      <fbt desc="create Select photos help">Select photos</fbt>
                    </div>
                  </ImagePicker>
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
                    className="btn btn-outline-primary"
                    to={this.props.prev}
                  >
                    <fbt desc="back">Back</fbt>
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    <fbt desc="continue">Continue</fbt>{' '}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4 d-none d-md-block">
          <Wallet />
          <div className="gray-box">
            <fbt desc="create.Add Listing Details">
              <h5>Add Listing Details</h5>
              Be sure to give your listing an appropriate title and description
              to let others know what you&apos;re offering. Adding some photos
              will increase the chances of selling your listing.
            </fbt>{' '}
          </div>
        </div>
      </div>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.title) {
      newState.titleError = fbt('Title is required', 'create.error.Title is required')
    } else if (this.state.title.length < 3) {
      newState.titleError = fbt('Title is too short', 'create.error.Title is too short')
    } else if (this.state.title.length > 100) {
      // Limit from origin-validator/src/schemas/listing.json
      newState.titleError = fbt('Title is too long', 'create.error.Title is too long')
    }

    if (!this.state.description) {
      newState.descriptionError = fbt('Description is required', 'create.error.Description is required')
    } else if (this.state.description.length < 10) {
      newState.descriptionError = fbt('Description is too short', 'create.error.Description is too short')
    } else if (this.state.description.length > 1024) {
      // Limit from origin-validator/src/schemas/listing.json
      newState.descriptionError = fbt('Description is too long', 'create.error.Description is too long')
    }

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

export default Details
