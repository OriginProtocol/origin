import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import MessagingQuery from 'queries/Messaging'
import ConversationsQuery from 'queries/Conversations'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import Avatar from 'components/Avatar'
import Dropdown from 'components/Dropdown'
import Link from 'components/Link'

import distanceToNow from 'utils/distanceToNow'

const getUnreadMessage = count => {
  if (count === 1) return 'Unread Message'
  return 'Unread Messages'
}

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
              content={
                <MessagesDropdown
                  onClick={() => this.props.onClose()}
                  data={data}
                  wallet={this.props.wallet}
                  identity={this.props.identity}
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

const MessagesDropdown = props => {
  const { onClick, wallet } = props

  return (
    <div className="dropdown-menu dropdown-menu-right show messages">
      <Query
        query={ConversationsQuery}
        pollInterval={2000}
        variables={{ wallet }}
      >
        {({ data, error, loading }) => {
          if (loading || error) return null
          const conversations = get(data, 'messaging.conversations', [])
          const messages = conversations.map(({ messages }) => messages)
          const totalUnreadMessages = messages.flat().reduce((result, msg) => {
            if (msg.status === 'unread' && msg.address !== wallet)
              return [...result, msg]
            return result
          }, [])

          const lastMessage = [...totalUnreadMessages].pop() || {}
          const { address, content, timestamp } = lastMessage

          return (
            <div>
              <div className="row unread-notifications">
                <span className="count align-self-center">
                  {totalUnreadMessages.length}
                </span>
                <span>{getUnreadMessage(totalUnreadMessages.length)}</span>
              </div>
              <div>
                {Object.keys(lastMessage).length ? (
                  <div className="row last-message">
                    <div className="column">
                      <Avatar
                        avatar={get(props, 'identity.profile.avatar')}
                        size={60}
                      />
                    </div>
                    <div className="column content">
                      <div className="row">
                        <span>{address}</span>
                      </div>
                      <div className="row message">
                        <span>{content}</span>
                      </div>
                    </div>
                    <div className="column timestamp ml-auto">
                      <span>{distanceToNow(timestamp)}</span>
                    </div>
                  </div>
                ) : null}
              </div>
              <Link to="/messages" onClick={() => onClick()}>
                View Messages
              </Link>
            </div>
          )
        }}
      </Query>
    </div>
  )
}

export default withWallet(withIdentity(MessagesNav))

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
      .dropdown-menu.messages
        padding: 1rem
        padding-top: 0
        background-color: var(--pale-grey-two)
      &.show
        .count
          border-radius: 44%
          background-color: var(--greenblue)
          width: 28px
          height: 21px
          color: white
          padding-left: 9px
          padding-bottom: 25px
          font-weight: bold
        .unread-notifications
          width: 530px
          font-weight: 600
          font-size: 18px
          padding: 1rem 0
          background-color: var(--white)
          span
            margin-left: 10px
        a
          text-align: center
          display: block
          padding-top: 15px
        .last-message
          background-color: var(--white)
          border-top: 2px solid var(--pale-grey-two)
          padding: 10px
          .timestamp
            color: var(--bluey-grey)
            font-size: 12px
          .content
            padding-left: 20px
            span
              font-weight: 400
              -ms-flex: 1
              -moz-flex: 1
              -webkit-flex: 1
              flex: 1
              width: 150px
            .message
              span
                white-space: nowrap
                overflow: hidden
                text-overflow: ellipsis
                font-weight: bold
                -ms-flex: 1
                -moz-flex: 1
                -webkit-flex: 1
                flex: 1
`)
