import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import pick from 'lodash/pick'

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
          onClose={() => this.setState({ shouldClose: true })}
          {...pick(this.props, [
            'firstName',
            'lastName',
            'description',
            'avatarUrl',
            'onChange',
            'onSave'
          ])}
        />
      </ModalComp>
    )
  }
}

export default withIsMobile(withConfig(EditProfileModal))
