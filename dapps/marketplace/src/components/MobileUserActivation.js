import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import MobileModal from './MobileModal'
import UserActivation from './DesktopUserActivation'

class MobileUserActivation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modal: true,
      shouldClose: false,
      title: fbt('Create a Profile', 'MobileUserActivation.createProfile')
    }
  }

  render() {
    const { modal, shouldClose, title } = this.state

    if (!modal) {
      return null
    }

    return (
      <>
        <MobileModal
          onClose={() => this.onClose()}
          shouldClose={shouldClose}
          title={title}
        >
          <UserActivation
            onProfileCreated={() => this.setState({ title: null })}
            onCompleted={() => {
              this.setState({
                shouldClose: true
              })
            }}
            renderMobileVersion={true}
          />
        </MobileModal>
      </>
    )
  }

  onClose() {
    this.setState({
      modal: false
    })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }
}

export default MobileUserActivation
