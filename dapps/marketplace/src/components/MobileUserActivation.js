import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import withConfig from 'hoc/withConfig'
import withWallet from 'hoc/withWallet'

import MobileModal from './MobileModal'
import UserActivation from './UserActivation'

class MobileUserActivation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modal: true,
      shouldClose: false
    }
  }

  render() {
    const { modal, shouldClose } = this.state

    if (!modal) {
      return null
    }

    return (
      <>
        <MobileModal
          onClose={() => this.onClose()}
          shouldClose={shouldClose}
          title={
            <fbt desc="MobileUserActivation.createProfile">
              Create a Profile
            </fbt>
          }
        >
          <UserActivation
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
