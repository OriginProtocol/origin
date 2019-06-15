import React, { Component } from 'react'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import Avatar from 'components/Avatar'
import ImageCropper from 'components/ImageCropper'
import { uploadImages } from 'utils/uploadImages'

import { formInput, formFeedback } from 'utils/formHelpers'

import withConfig from 'hoc/withConfig'
import withIsMobile from 'hoc/withIsMobile'

class EditProfileModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...pick(props, ['firstName', 'lastName', 'description', 'avatarUrl']),
      imageCropperOpened: false
    }
  }

  componentDidMount() {
    if (this.input) {
      this.input.focus()
    }
  }

  isMobile() {
    return this.props.ismobile === 'true'
  }

  render() {
    const input = formInput(this.state, state => this.setState(state), this.props.lightMode ? '' : 'dark')
    const Feedback = formFeedback(this.state)
    const hasAvatar = this.state.avatarUrl

    const isMobile = this.isMobile()

    const ModalComp = isMobile ? MobileModal : Modal

    const titleContent = fbt('Edit Profile', 'EditModal.editProfile')

    return (
      // Using css hide Edit Profile dialog when image cropper is opened
      <ModalComp
        title={titleContent}
        onClose={() => this.props.onClose()}
        shouldClose={this.state.shouldClose}
        classNameOuter={this.state.imageCropperOpened ? 'd-none' : ''}
        lightMode={this.props.lightMode}
      >
        <form
          className={`edit-profile-modal${this.props.lightMode ? ' light-theme' : ''}`}
          onSubmit={e => {
            e.preventDefault()
            this.validate()
          }}
        >
          <h2>
            {isMobile ? null : titleContent}
          </h2>
          <div className="row">
            <div className="col-6">
              <ImageCropper
                onChange={async avatarBase64 => {
                  const { ipfsRPC } = this.props.config
                  const uploadedImages = await uploadImages(ipfsRPC, [
                    avatarBase64
                  ])
                  const avatarImg = uploadedImages[0]
                  if (avatarImg) {
                    const avatarUrl = avatarImg.url
                    this.setState({ avatarUrl })
                  }
                }}
                openChange={open =>
                  this.setState({
                    imageCropperOpened: open
                  })
                }
              >
                <Avatar
                  className="avatar with-cam"
                  avatarUrl={this.state.avatarUrl}
                />
              </ImageCropper>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label>
                  <fbt desc="EditModal.firstName">First Name</fbt>
                </label>
                <input
                  type="text"
                  maxLength="40"
                  {...input('firstName')}
                  ref={r => (this.input = r)}
                />
                {Feedback('firstName')}
              </div>
              <div className="form-group">
                <label>
                  <fbt desc="EditModal.lastName">Last Name</fbt>
                </label>
                <input type="text" maxLength="40" {...input('lastName')} />
                {Feedback('lastName')}
              </div>
            </div>
          </div>

          <div className="form-group mt-3">
            <label>
              <fbt desc="EditModal.Description">Description</fbt>
            </label>
            <textarea
              placeholder="Tell us a bit about yourself"
              {...input('description')}
            />
            {Feedback('description')}
          </div>
          <div className="help">
            <fbt desc="EditModal.infoWillBePublished">
              This information will be published on the blockchain and will be
              visible to everyone.
            </fbt>
          </div>

          <div className="actions d-flex">
            <button
              className="btn btn-primary"
              children={fbt('OK', 'OK')}
              onClick={() => {
                if (this.validate()) {
                  this.props.onChange(
                    pick(this.state, ['firstName', 'lastName', 'description'])
                  )
                  if (this.state.avatarUrl) {
                    this.props.onAvatarChange(this.state.avatarUrl)
                  }
                  this.setState({ shouldClose: true })
                }
              }}
            />
            {
              isMobile ? null : (
                <button
                  className="btn btn-link"
                  children={fbt('Cancel', 'Cancel')}
                  onClick={() => this.setState({ shouldClose: true })}
                />
              )
            }
          </div>
        </form>
      </ModalComp>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.firstName) {
      newState.firstNameError = fbt(
        'First Name is required',
        'EditModel.firstNameRequired'
      )
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    this.setState(newState)
    return newState.valid
  }
}

export default withIsMobile(withConfig(EditProfileModal))

require('react-styl')(`
  .edit-profile-modal
    width: 100%
    text-align: left
    h2
      text-align: center
    .avatar
      border-radius: 50%
    .help
      font-size: 14px
      line-height: normal
      text-align: center
      margin-top: 2rem
    .actions
      display: flex
      flex-direction: column
      margin: 2rem auto 0 auto
      width: 50%
`)
