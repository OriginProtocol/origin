import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'

import EditProfile from './_EditProfile'

import withConfig from 'hoc/withConfig'
import withIsMobile from 'hoc/withIsMobile'

class EditProfileModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageCropperOpened: false
    }
  }

  render() {
    const isMobile = this.props.isMobile

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
        <EditProfile
          imageCropperToggled={open => {
            this.setState({
              imageCropperOpened: open
            })
          }}
          onChange={this.props.onChange}
          onAvatarChange={this.props.onAvatarChange}
          onClose={() => this.setState({ shouldClose: true })}
        />
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
      .avatar
        max-width: 110px
        max-height: 110px
        padding-top: 110px
        margin: 0 auto
      .profile-name-fields
        display: flex
        flex-direction: row
        > div
          margin-right: 10px
          &:last-child
            margin-left: 10px
            margin-right: 0

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
`)
