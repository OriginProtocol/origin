import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import UnlinkMobileWallet from 'mutations/UnlinkMobileWallet'

class MobileLinkToggle extends Component {
  constructor(props) {
    super(props)
  }

  render () {
    if (this.props.isConnected) {
      return (
        <Mutation mutation={UnlinkMobileWallet}>
          <button className="btn btn-outline-danger">
            Disconnect
          </button>
        </Mutation>
      )
    } else {
      return (
        <button className="btn btn-outline-secondary" disabled>
          <span>Not connected</span>
        </button>
      )
    }
  }
}

export default MobileLinkToggle
