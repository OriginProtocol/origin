import React, { Component } from 'react'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import Avatar from 'components/Avatar'
import ImageCropper from 'components/ImageCropper'
import PublishedInfoBox from 'components/_PublishedInfoBox'
import MobileModal from 'components/MobileModal'

import { uploadImages } from 'utils/uploadImages'
import { formInput, formFeedback } from 'utils/formHelpers'

import withConfig from 'hoc/withConfig'
import withIsMobile from 'hoc/withIsMobile'

function profileUpdated(state, prevState) {
  return (
    state.firstName !== prevState.firstName ||
    state.lastName !== prevState.lastName ||
    state.description !== prevState.description ||
    state.avatarUrl !== prevState.avatarUrl
  )
}

class EditProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...pick(props, ['firstName', 'lastName', 'description', 'avatarUrl']),
      shouldClosePersonalDataModal: false,
      personalDataModal: false
    }
  }

  componentDidMount() {
    if (this.input) {
      this.input.focus()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onChange && profileUpdated(this.state, prevState || {})) {
      this.props.onChange(
        pick(this.state, ['firstName', 'lastName', 'description', 'avatarUrl'])
      )
    }
  }

  render() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    const { isMobile, onboarding } = this.props

    const titleContent = onboarding
      ? fbt('Add name and photo', 'EditModal.addNameAndPhoto')
      : fbt('Edit Profile', 'EditModal.editProfile')

    return (
      <>
        {this.renderPersonalDataModal()}
        <form
          className={`edit-profile-modal light-theme${
            this.props.className ? ' ' + this.props.className : ''
          }${onboarding ? ' onboarding' : ''}`}
          onSubmit={e => {
            e.preventDefault()
            if (this.validate()) {
              this.onSave()
              this.onClose()
            }
          }}
        >
          {<h2>{isMobile ? null : titleContent}</h2>}
          <div className="profile-fields-container">
            <div className="avatar-image-container">
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
                openChange={this.props.imageCropperToggled}
              >
                <Avatar
                  className="avatar with-cam"
                  avatarUrl={this.state.avatarUrl}
                />
              </ImageCropper>
            </div>
            <div className="profile-name-fields mt-3">
              <div className="form-group">
                {(!onboarding || isMobile) && (
                  <label>
                    <fbt desc="EditModal.firstName">First Name</fbt>
                  </label>
                )}
                <input
                  type="text"
                  maxLength="40"
                  {...input('firstName')}
                  ref={r => (this.input = r)}
                  placeholder={
                    onboarding && !isMobile ? (
                      <fbt desc="EditModal.firstName">First Name</fbt>
                    ) : null
                  }
                />
                {Feedback('firstName')}
              </div>
              <div className="form-group">
                {(!onboarding || isMobile) && (
                  <label>
                    <fbt desc="EditModal.lastName">Last Name</fbt>
                  </label>
                )}
                <input
                  type="text"
                  maxLength="40"
                  {...input('lastName')}
                  placeholder={
                    onboarding && !isMobile ? (
                      <fbt desc="EditModal.lastName">Last Name</fbt>
                    ) : null
                  }
                />
                {Feedback('lastName')}
              </div>
            </div>
            {!onboarding && (
              <div className="form-group">
                <label>
                  <fbt desc="EditModal.Description">Description</fbt>
                </label>
                <textarea
                  placeholder="Tell us a bit about yourself"
                  {...input('description')}
                />
                {Feedback('description')}
              </div>
            )}
            {onboarding && (
              <div className="help">
                <fbt desc="UserActivation.easierToIdentify">
                  By providing a photo and name, you’ll make it easier for
                  buyers and sellers on Origin to identify you.
                </fbt>
              </div>
            )}
          </div>
          <PublishedInfoBox
            title={fbt(
              'What will be visible on the blockchain?',
              'EditModal.visibleOnChain'
            )}
            children={
              <>
                <fbt desc="EditModal.nameAndPhoto">
                  Your photo, name, and description
                </fbt>
                <a
                  onClick={e => {
                    e.preventDefault()
                    this.setState({
                      personalDataModal: true,
                      shouldClosePersonalDataModal: false
                    })
                  }}
                >
                  <fbt desc="UserActivation.learnMore">Learn more</fbt>
                </a>
              </>
            }
            pii={true}
          />
          <div className="actions d-flex">
            <button
              className="btn btn-primary btn-rounded"
              children={
                onboarding ? (
                  <fbt desc="Publish">Publish</fbt>
                ) : (
                  <fbt desc="Save">Save</fbt>
                )
              }
              type="submit"
            />
            {!isMobile && !onboarding && (
              <button
                className="btn btn-link"
                children={fbt('Cancel', 'Cancel')}
                onClick={() => this.onClose()}
              />
            )}
          </div>
        </form>
      </>
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

    if (this.props.onboarding && !this.state.lastName) {
      newState.lastNameError = fbt(
        'Last Name is required',
        'EditModel.lastNameRequired'
      )
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    this.setState(newState)
    return newState.valid
  }

  onSave() {
    if (this.props.onSave) {
      const profile = pick(this.state, [
        'firstName',
        'lastName',
        'description',
        'avatarUrl'
      ])

      this.props.onSave(profile, profileUpdated(profile, this.props))
    }
  }

  onClose() {
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  renderPersonalDataModal() {
    if (!this.state.personalDataModal) {
      return null
    }

    return (
      <MobileModal
        headerImageUrl="images/onboard/tout-header-image@3x.png"
        closeOnEsc={false}
        shouldClose={this.state.shouldClosePersonalDataModal}
        className="user-activation personal-data-modal onboarding text-center"
        fullscreen={false}
        onClose={() =>
          this.setState({
            personalDataModal: false
          })
        }
      >
        <h2>
          <fbt desc="UserActivation.blockchainAndPersonalData">
            Blockchain &amp; Your Personal Data
          </fbt>
        </h2>
        <p>
          <fbt desc="UserActivation.personalDataInfo">
            By creating a profile, you are associating your name and photo with
            your Ethereum account. This means that others will be able to
            connect your blockchain transactions to your name and photo.
          </fbt>
        </p>
        <div className="actions">
          <button
            className="btn btn-primary btn-rounded"
            onClick={() =>
              this.setState({ shouldClosePersonalDataModal: true })
            }
          >
            <fbt desc="Got it">Got it</fbt>
          </button>
        </div>
      </MobileModal>
    )
  }
}

export default withIsMobile(withConfig(EditProfile))

require('react-styl')(`
  .edit-profile-modal
    width: 100%
    text-align: left
    flex: auto
    display: flex
    flex-direction: column
    h2
      text-align: center
    .avatar
      border-radius: 50%
    .actions
      display: flex
      flex-direction: column
      flex: auto 0 0
      padding: 20px
      text-align: center
      .btn
        width: 50%
        margin: 0 auto
        &.btn-link
          margin-top: 1rem
    
    .profile-fields-container
      display: flex
      flex-direction: column
      flex: auto
      .avatar-image-container
        display: flex
        flex-direction: row
        justify-content: space-around
      .avatar
        width: 110px
        height: 110px
        padding-top: 110px
        margin: 0
      .profile-name-fields
        display: flex
        flex-direction: row
        > div
          margin-right: 10px
          &:last-child
            margin-left: 10px
            margin-right: 0

    &.onboarding
      .profile-fields-container
        .profile-name-fields
          flex-direction: column
          > div, > div:last-child
            margin-right: 0
            margin-left: 0

  @media (max-width: 767.98px)
    .edit-profile-modal
      padding: 0 20px
      .profile-fields-container
        .avatar
          max-width: 100px
          max-height: 100px
          padding-top: 100px
          margin: 0 auto
      .actions
        margin-top: auto
        .btn
          width: 100%
          margin-top: 3rem
      &.onboarding .actions
          padding: 0
`)
