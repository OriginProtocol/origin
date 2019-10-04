import React from 'react'
import get from 'lodash/get'

import distanceToNow from 'utils/distanceToNow'
import withIdentity from 'hoc/withIdentity'

import Avatar from 'components/Avatar'

import Link from 'components/Link'

import OfferEvent from 'pages/messaging/OfferEvent'

const RoomStatus = ({ conversation, identity, onClick, active, wallet }) => {
  const name = get(identity, 'fullName', conversation.id)

  const lastMessage = conversation.lastMessage

  const timestamp = lastMessage ? lastMessage.timestamp : conversation.timestamp

  return (
    <Link
      className={`room-status${active ? ' active' : ''}`}
      to={`/messages/${conversation.id}`}
      onClick={onClick}
    >
      <Avatar profile={identity} size={40} />
      <div className="right">
        <div className="top">
          <div className="name">{name}</div>
          <div className="time">{distanceToNow(timestamp)}</div>
        </div>
        <div className="bottom">
          {!lastMessage ? null : (
            <div className="last-message">
              {lastMessage.type === 'event' ? (
                <OfferEvent
                  event={lastMessage}
                  wallet={wallet}
                  minimal={true}
                />
              ) : (
                get(conversation, 'lastMessage.content')
              )}
            </div>
          )}
          {!conversation.totalUnread ? null : (
            <div className="unread">{conversation.totalUnread}</div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default withIdentity(RoomStatus, 'conversation.id')

require('react-styl')(`
  .room-status
    padding: 1.1rem 0.75rem
    display: flex
    cursor: pointer
    font-size: 16px
    border-bottom: 1px solid #dde6ea
    color: #000
    &:last-child
      border: 0
    &.active
      background: rgba(0, 0, 0, 0.1)
      color: #000
      .time
        color: var(--white)
    &:hover
      color: #000
    .avatar
      align-self: flex-start
      flex: 0 0 40px
    .right
      display: flex
      flex: 1
      flex-direction: column
      margin-left: 0.5rem
      min-width: 0
      .top
        display: flex
        flex: 1
        align-items: center
        .name
          flex: 1
          white-space: nowrap
          overflow: hidden
          text-overflow: ellipsis
          font-weight: bold
        .time
          color: var(--bluey-grey)
          font-size: 12px
          font-weight: normal
          margin-left: 0.25rem
      .bottom
        display: flex
        flex: 1
        align-items: flex-start
        font-size: 12px
        .last-message
          flex: 1
          line-height: normal
          font-weight: normal
          white-space: nowrap
          overflow: hidden
          text-overflow: ellipsis
        .unread
          font-weight: bold
          border-radius: 1rem
          background-color: var(--clear-blue)
          color: white
          padding: 0 0.5rem
          margin-left: 0.25rem
    .offer-event
      font-style: italic
      color: var(--bluey-grey)

`)
