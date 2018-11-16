import React, { Component } from 'react'

import { ContextMenuTarget, Menu, MenuItem } from '@blueprintjs/core'

@ContextMenuTarget
class Address extends Component {
  render() {
    const { address } = this.props
    if (!address) {
      return null
    }
    const addressId = typeof address === 'string' ? address : address.id
    if (addressId === '0x0000000000000000000000000000000000000000') {
      return null
    }
    return (
      <span style={{ fontFamily: 'monospace' }}>{addressId.substr(0, 6)}</span>
    )
  }

  getAddress() {
    const { address } = this.props
    return typeof address === 'string' ? address : address.id
  }

  renderContextMenu() {
    return (
      <Menu>
        <MenuItem
          text="Copy Address"
          onClick={() => {
            navigator.clipboard.writeText(this.getAddress()).then(
              function() {
                /* success */
              },
              function() {
                /* failure */
              }
            )
          }}
        />
      </Menu>
    )
  }
}

export default Address
