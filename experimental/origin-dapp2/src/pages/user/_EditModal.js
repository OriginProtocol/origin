import React, { Component } from 'react'
import pick from 'lodash/pick'

import ImageCropper from 'components/ImageCropper'
import Modal from 'components/Modal'

import { formInput, formFeedback } from 'utils/formHelpers'

class EditProfileModal extends Component {
  constructor(props) {
    super(props)
    this.state = pick(props, ['firstName', 'lastName', 'description', 'avatar'])
  }

  render() {
    const { avatar } = this.state
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <Modal
        onClose={() => this.props.onClose()}
        shouldClose={this.state.shouldClose}
      >
        <form
          className="edit-profile-modal"
          onSubmit={e => {
            e.preventDefault()
            this.validate()
          }}
        >
          <div className="row">
            <div className="col-4">
              <ImageCropper onChange={a => this.setState({ avatar: a })}>
                <div
                  className={`profile-logo ${avatar ? 'custom' : 'default'}`}
                  style={{
                    backgroundImage: avatar ? `url(${avatar})` : null
                  }}
                />
              </ImageCropper>
            </div>
            <div className="col-8">
              <div className="row">
                <div className="form-group col-6">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    {...input('firstName')}
                  />
                  {Feedback('firstName')}
                </div>
                <div className="form-group col-6">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    {...input('lastName')}
                  />
                  {Feedback('lastName')}
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  placeholder="Tell us a bit about yourself"
                  {...input('description')}
                />
                {Feedback('description')}
              </div>
            </div>
          </div>
          <div className="actions d-flex">
            <button
              className="btn btn-outline-light"
              children="OK"
              onClick={() => {
                this.props.onChange(
                  pick(this.state, [
                    'firstName',
                    'lastName',
                    'description',
                    'avatar'
                  ])
                )
                this.setState({ shouldClose: true })
              }}
            />
            <button
              className="btn btn-link"
              children="Cancel"
              onClick={() => this.setState({ shouldClose: true })}
            />
          </div>
        </form>
      </Modal>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.firstName) {
      newState.firstNameError = 'First Name is required'
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    this.setState(newState)
    return newState.valid
  }
}

export default EditProfileModal

require('react-styl')(`
`)
