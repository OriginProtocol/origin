import React, { Component } from 'react'
import { Query } from 'react-apollo'

import ProfileQuery from 'queries/Profile'
import Identicon from 'components/Identicon'
import Dropdown from 'components/Dropdown'

class ProfileNav extends Component {
  constructor() {
    super()
    this.state = {}
  }
  render() {
    return (
      <Query query={ProfileQuery}>
        {({ data, loading, error }) => {
          console.log(data, loading, error)
          if (loading || error) return null
          if (!data || !data.web3 || !data.web3.metaMaskAccount) {
            return null
          }
          const { checksumAddress } = data.web3.metaMaskAccount
          return (
            <Dropdown
              el="li"
              className="nav-item dark"
              open={this.state.open}
              onClose={() => this.setState({ open: false })}
              content={this.renderDropdown(data)}
            >
              <a
                className="nav-link profile"
                href="#"
                onClick={e => {
                  e.preventDefault()
                  this.setState({ open: this.state.open ? false : true })
                }}
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <Identicon address={checksumAddress} />
              </a>
            </Dropdown>
          )
        }}
      </Query>
    )
  }

  renderDropdown(data) {
    const { checksumAddress } = data.web3.metaMaskAccount
    return (
      <div className="dropdown-menu dark dropdown-menu-right show profile">
        <div className="wallet-info">
          <div>
            <h5>ETH Address</h5>
            <div className="wallet-address">{checksumAddress}</div>
          </div>
          <div className="identicon">
            <Identicon size={50} address={checksumAddress} />
          </div>
        </div>
      </div>
    )
  }
}

export default ProfileNav

require('react-styl')(`
  .nav-link.profile img
    margin: 0 0.2rem
  .dropdown-menu.profile
    width: 300px
    padding: 1.5rem
    .wallet-info
      display: flex
      flex-direction: row
      font-size: 14px
      h5
        color: var(--light)
        font-size: 14px
      .wallet-address
        word-break: break-all
        line-height: normal
      .identicon
        margin-left: 0.5rem
        display: flex
        align-items: center

`)
