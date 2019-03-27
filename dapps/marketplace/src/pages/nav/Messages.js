import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { withRouter } from 'react-router-dom'
import { fbt } from 'fbt-runtime'

import MessagingQuery from 'queries/Messaging'
import ConversationsQuery from 'queries/Conversations'

import withWallet from 'hoc/withWallet'

import Dropdown from 'components/Dropdown'
import Link from 'components/Link'
import EnableMessaging from 'components/EnableMessaging'
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
          const enabled = get(data, 'messaging.enabled', false)
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
                  error={error}
                  loading={loading}
                  enabled={enabled}
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

const Error = () => (
  <div className="dropdown-menu dropdown-menu-right show p-3">
    <fbt desc="messages.errorLoading">Error loading messages</fbt>
  </div>
)
const Loading = () => (
  <div className="dropdown-menu dropdown-menu-right show p-3">
    <fbt desc="messages.loading">Loading...</fbt>
  </div>
)

class MessagesDropdown extends Component {
  state = {}
  render() {
    const { onClick, totalUnread, enabled, loading, error } = this.props

    if (error) {
      return <Error />
    } else if (loading) {
      return <Loading />
    }

    return (
      <Query query={ConversationsQuery} pollInterval={500}>
        {({ data, error, loading }) => {
          if (error) {
            return <Error />
          } else if (loading) {
            return <Loading />
          }

          const conversations = get(data, 'messaging.conversations', [])
            .filter(c => c.totalUnread > 0)
            .slice(0, 5)

          return (
            <div className="dropdown-menu dropdown-menu-right show">
              <div className="count">
                <div className="total">{totalUnread}</div>
                <div className="title">
                  <fbt desc="messages.unreadMessages">
                    Unread
                    <fbt:plural count={totalUnread} showCount="no">
                      Message
                    </fbt:plural>
                  </fbt>
                </div>
                {enabled ? null : (
                  <EnableMessaging
                    className="btn-sm"
                    onClose={() => onClick()}
                  />
                )}
              </div>
              <div className="messaging-dropdown-content">
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
                <fbt desc="messages.viewMessages">View Messages</fbt>
              </Link>
            </div>
          )
        }}
      </Query>
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
    .count .btn
      margin-left: 1.5rem
    .count.title
      margin-right: auto
    .messaging-dropdown-content
      max-width: 450px
`)
