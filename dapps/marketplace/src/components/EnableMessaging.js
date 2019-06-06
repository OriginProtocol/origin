import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import withIdentity from 'hoc/withIdentity'
import withWallet from 'hoc/withWallet'

import Modal from 'components/Modal'
import EnableMessagingModal from 'components/EnableMessagingModal'
import UserActivationLink from 'components/UserActivationLink'

class EnableMessaging extends Component {
  state = {}
  render() {
    const { identity } = this.props

    if (!identity) {
      return (
        <UserActivationLink
          className={`btn btn-primary btn-rounded${className}`}
          location={{ pathname: '/messages' }}
          onClick={() => {
            if (this.props.onClose) {
              this.props.onClose()
            }
          }}
        >
          <fbt desc="Enable Messaging">Enable Messaging</fbt>
        </UserActivationLink>
      )
    }

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

export default withWallet(withIdentity(EnableMessaging))
