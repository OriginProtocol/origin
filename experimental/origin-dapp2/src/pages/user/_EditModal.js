import React, { Component } from 'react'
import pick from 'lodash/pick'

import ImageCropper from 'components/ImageCropper'
import Modal from 'components/Modal'
import Avatar from 'components/Avatar'

import { formInput, formFeedback } from 'utils/formHelpers'

class EditProfileModal extends Component {
  constructor(props) {
    super(props)
    this.state = pick(props, ['firstName', 'lastName', 'description', 'avatar'])
  }

  componentDidMount() {
    if (this.input) {
      this.input.focus()
    }
  }

  render() {
    const { avatar } = this.state
    const input = formInput(this.state, state => this.setState(state), 'dark')
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
          <h2>Edit Profile</h2>
          <div className="row">
            <div className="col-6">
              <ImageCropper onChange={a => this.setState({ avatar: a })}>
                <Avatar avatar={avatar} className="dark with-cam" />
              </ImageCropper>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  {...input('firstName')}
                  ref={r => (this.input = r)}
                />
                {Feedback('firstName')}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" {...input('lastName')} />
                {Feedback('lastName')}
              </div>
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Description</label>
            <textarea
              placeholder="Tell us a bit about yourself"
              {...input('description')}
            />
            {Feedback('description')}
          </div>
          <div className="help">
            This information will be published on the blockchain and will be
            visible to everyone.
          </div>

          <div className="actions d-flex">
            <button
              className="btn btn-outline-light"
              children="OK"
              onClick={() => {
                if (this.validate()) {
                  this.props.onChange(
                    pick(this.state, [
                      'firstName',
                      'lastName',
                      'description',
                      'avatar'
                    ])
                  )
                  this.setState({ shouldClose: true })
                }
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
  .edit-profile-modal
    width: 100%
    text-align: left
    h2
      text-align: center
    .avatar
      border-radius: 1rem
    .help
      font-size: 14px;
      line-height: normal;
      text-align: center;
      margin-top: 2rem;
    .actions
      display: flex
      flex-direction: column
      margin: 2rem auto 0 auto
      width: 50%
`)
