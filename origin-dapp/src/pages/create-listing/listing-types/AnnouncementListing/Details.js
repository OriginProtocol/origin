import React, { Component } from 'react'
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
              <div className="step">{`Step ${this.props.step}`}</div>
              <div className="step-description">Provide listing details</div>
              <Steps steps={this.props.steps} step={this.props.step} />

              <form
                onSubmit={e => {
                  e.preventDefault()
                  this.validate()
                }}
              >
                {this.state.valid !== false ? null : (
                  <div className="alert alert-danger">
                    Please fix the errors below...
                  </div>
                )}
                <div className="form-group">
                  <label>Title</label>
                  <input {...input('title')} ref={r => (this.titleInput = r)} />
                  {Feedback('title')}
                </div>
                <div className="form-group">
                  <label className="mb-0">Description</label>
                  <textarea {...input('description')} />
                  {Feedback('description')}
                </div>

                {/* Listing specific fields go here, but Announcements have none. */}

                <div className="form-group">
                  <label>Select photos</label>
                  <ImagePicker
                    images={this.state.media}
                    onChange={media => this.setState({ media })}
                  >
                    <div className="add-photos">Select photos</div>
                  </ImagePicker>
                  <ul className="help-text photo-help list-unstyled">
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
                  </ul>
                </div>

                <div className="actions">
                  <Link
                    className="btn btn-outline-primary"
                    to={this.props.prev}
                  >
                    Back
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4 d-none d-md-block">
          <Wallet />
          <div className="gray-box">
            <h5>Add Listing Details</h5>
            Be sure to give your listing an appropriate title and description to
            let others know what you&apos;re offering. Adding some photos will
            increase the chances of selling your listing.
          </div>
        </div>
      </div>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.title) {
      newState.titleError = 'Title is required'
    } else if (this.state.title.length < 3) {
      newState.titleError = 'Title is too short'
    } else if (this.state.title.length > 100) {
      // Limit from origin-validator/src/schemas/listing.json
      newState.titleError = 'Title is too long'
    }

    if (!this.state.description) {
      newState.descriptionError = 'Description is required'
    } else if (this.state.description.length < 10) {
      newState.descriptionError = 'Description is too short'
    } else if (this.state.description.length > 1024) {
      // Limit from origin-validator/src/schemas/listing.json
      newState.descriptionError = 'Description is too long'
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
