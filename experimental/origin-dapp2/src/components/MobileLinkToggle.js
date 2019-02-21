import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import get from 'lodash/get'

import UnlinkMobileWallet from 'mutations/UnlinkMobileWallet'
import ProfileQuery from 'queries/Profile'

class MobileLinkToggle extends Component {
  render () {
    return (
      <Query query={ProfileQuery}>
        {({ data }) => {
          const walletType = get(data.web3, 'walletType')
          const mobileWalletConnected = walletType && walletType.startsWith('mobile-')
          if (mobileWalletConnected) {
            return (
              <Mutation mutation={UnlinkMobileWallet}>
                <button className="btn btn-outline-danger">
                  Disconnect
                </button>
              </Mutation>
            )
          } else {
            return (
              <>
                <button className="btn btn-outline-secondary" disabled>
                  <span>Not connected</span>
                </button>
              </>
            )
          }
        }}
      </Query>
    )
  }
}

export default MobileLinkToggle
