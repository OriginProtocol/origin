import React from 'react'
import get from 'lodash/get'

import distanceToNow from 'utils/distanceToNow'
import withIdentity from 'hoc/withIdentity'

import Avatar from 'components/Avatar'

const RoomStatus = ({ conversation, identity, onClick, active }) => {
  const name = get(identity, 'fullName', conversation.id)
  if (!conversation.lastMessage) {
    return null
  }
  const timestamp = conversation.lastMessage
    ? conversation.lastMessage.timestamp
    : conversation.timestamp
  return (
    <div
      className={`room-status${active ? ' active' : ''}`}
      onClick={() => (onClick ? onClick() : {})}
    >
      <Avatar avatar={get(identity, 'avatar')} size={40} />
      <div className="right">
        <div className="top">
          <div className="name">{name}</div>
          <div className="time">{distanceToNow(timestamp)}</div>
        </div>
        <div className="bottom">
          <div className="last-message">
            {get(conversation, 'lastMessage.content')}
          </div>
          {!conversation.totalUnread ? null : (
            <div className="unread">{conversation.totalUnread}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default withIdentity(RoomStatus)

require('react-styl')(`
  .room-status
    padding: 0.75rem
    display: flex
    cursor: pointer
    font-size: 16px
    &.active
      background: var(--dusk)
      color: var(--white)
      .time
        color: var(--white)
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

`)
