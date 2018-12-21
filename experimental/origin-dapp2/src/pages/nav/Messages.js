import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import MessagingQuery from 'queries/Messaging'

import Dropdown from 'components/Dropdown'

class MessagesNav extends Component {
  constructor() {
    super()
    this.state = {}
  }
  render() {
    return (
      <Query query={MessagingQuery}>
        {({ data, loading, error }) => {
          if (loading || error) return null
          if (!get(data, 'web3.metaMaskAccount.id')) {
            return null
          }

          const hasUnread = '' // active'
          return (
            <Dropdown
              el="li"
              className="nav-item messages"
              open={this.props.open}
              onClose={() => this.props.onClose()}
              content={<MessagesDropdown data={data} />}
            >
              <a
                className="nav-link"
                href="#"
                onClick={e => {
                  e.preventDefault()
                  this.props.open ? this.props.onClose() : this.props.onOpen()
                }}
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <div className={`messages-icon${hasUnread}`} />
              </a>
            </Dropdown>
          )
        }}
      </Query>
    )
  }
}

const MessagesDropdown = () => {
  return (
    <div className="dropdown-menu dropdown-menu-right show messages">
      Messages!
    </div>
  )
}

export default MessagesNav

require('react-styl')(`
  .navbar
    .nav-item
      .messages-icon
        width: 2.2rem
        height: 1.6rem
        background: url(images/messages-icon.svg) no-repeat center
        background-size: contain
        position:relative
        &.active
          &::after
            content: "";
            width: 14px;
            height: 14px;
            background: var(--greenblue);
            border-radius: 10px;
            border: 2px solid var(--dusk);
            position: absolute;
            top: -3px;
            right: -3px;
      &.show .messages-icon
        background-image: url(images/messages-icon-selected.svg)
      .dropdown-menu.messages
        padding: 1rem
`)
