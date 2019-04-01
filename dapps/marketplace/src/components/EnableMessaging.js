import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
import EnableMessagingModal from 'components/EnableMessagingModal'

class EnableMessaging extends Component {
  state = {}
  render() {
    const className = this.props.className ? ` ${this.props.className}` : ''
    return (
      <>
        <button
          className={`btn btn-primary btn-rounded${className}`}
          onClick={() => {
            this.setState({ open: true })
          }}
          children={fbt('Enable Messaging', 'Enable Messaging')}
        />

        {!this.state.open ? null : (
          <Modal
            shouldClose={this.state.shouldClose}
            onClose={() => {
              this.setState({ shouldClose: false, open: false })
              if (this.props.onClose) {
                this.props.onClose()
              }
            }}
          >
            <EnableMessagingModal />
          </Modal>
        )}
      </>
    )
  }
}

export default EnableMessaging
