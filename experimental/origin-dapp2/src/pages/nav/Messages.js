import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { withRouter } from 'react-router-dom'

import MessagingQuery from 'queries/Messaging'
import ConversationsQuery from 'queries/Conversations'

import withWallet from 'hoc/withWallet'

import Dropdown from 'components/Dropdown'
import Link from 'components/Link'
import RoomStatus from 'pages/messaging/RoomStatus'

class MessagesNav extends Component {
  constructor() {
    super()
    this.state = {}
  }
  render() {
    return (
      <Query query={MessagingQuery} pollInterval={2000}>
        {({ data, loading, error }) => {
          if (loading || error) return null
          if (!get(data, 'web3.metaMaskAccount.id')) {
            return null
          }

          const totalUnread = get(data, 'messaging.totalUnread', 0)

          const hasUnread = totalUnread > 0 ? ' active' : ''
          return (
            <Dropdown
              el="li"
              className="nav-item messages d-none d-md-flex"
              open={this.props.open}
              onClose={() => this.props.onClose()}
              content={
                <MessagesDropdownWithRouter
                  onClick={() => this.props.onClose()}
                  totalUnread={totalUnread}
                  wallet={this.props.wallet}
                />
              }
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

class MessagesDropdown extends Component {
  state = {}
  render() {
    const { onClick, totalUnread } = this.props

    return (
      <div className="dropdown-menu dropdown-menu-right show">
        <Query query={ConversationsQuery} pollInterval={2000}>
          {({ data, error, loading }) => {
            if (loading || error) return null
            const conversations = get(data, 'messaging.conversations', [])
              .filter(c => c.totalUnread > 0)
              .slice(0, 5)

            return (
              <>
                <div className="count">
                  <div className="total">{totalUnread}</div>
                  <div className="title">Unread Messages</div>
                </div>
                <div>
                  {conversations.map((conv, idx) => (
                    <RoomStatus
                      onClick={() => {
                        this.props.history.push({
                          pathname: `/messages/${conv.id}`,
                          state: { scrollToTop: true }
                        })
                        onClick()
                      }}
                      key={idx}
                      conversation={conv}
                      wallet={conv.id}
                    />
                  ))}
                </div>
                <Link to="/messages" onClick={() => onClick()}>
                  View Messages
                </Link>
              </>
            )
          }}
        </Query>
      </div>
    )
  }
}

const MessagesDropdownWithRouter = withRouter(MessagesDropdown)

export default withWallet(MessagesNav)

// Shares some styles with ./Notifications.js
require('react-styl')(`
  .navbar .nav-item.messages
    .messages-icon
      width: 2.2rem
      height: 1.6rem
      background: url(images/messages-icon.svg) no-repeat center
      background-size: contain
      position:relative
      &.active
        &::after
          content: ""
          width: 14px
          height: 14px
          background: var(--greenblue)
          border-radius: 10px
          border: 2px solid var(--dusk)
          position: absolute
          top: -3px
          right: -3px
    &.show .messages-icon
      background-image: url(images/messages-icon-selected.svg)
`)
