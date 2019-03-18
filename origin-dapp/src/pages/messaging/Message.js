import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import get from 'lodash/get'
import isNil from 'lodash/isNil'
import dayjs from 'dayjs'

import withIdentity from 'hoc/withIdentity'
import advancedFormat from 'dayjs/plugin/advancedFormat'

import Avatar from 'components/Avatar'
import { abbreviateName, truncateAddress } from 'utils/user'

dayjs.extend(advancedFormat)

const MAX_MINUTES = 10

function renderContent(message) {
  const { content, media } = message

  if (media && media.length) {
    return media.map(image => (
      <div key={image.url} className="image-container mx-auto">
        <img src={image.url} alt={'fileName'} />
      </div>
    ))
  } else if (content && typeof content === 'string') {
    if (content.match(/^data:image\/jpeg/)) {
      return (
        <div className="image-container mx-auto">
          <img src={content} alt={'fileName'} />
        </div>
      )
    }
    return (
      <>
        {content.split('\n').map((c, idx) => (
          <Fragment key={idx}>
            {c}
            <br />
          </Fragment>
        ))}
      </>
    )
  }
}

function showItems(props) {
  const { message, lastMessage, nextMessage, wallet } = props

  let showTime = true
  let showTailAndAvatar = true

  if (lastMessage) {
    const timeDiff = message.timestamp - lastMessage.timestamp
    if (timeDiff / 60 < MAX_MINUTES) {
      showTime = false
      if (lastMessage === wallet) {
        showTailAndAvatar = false
      }
    }
  }
  if (nextMessage) {
    const futureTimeDiff = nextMessage.timestamp - message.timestamp
    const sameSender = nextMessage.address === wallet

    if (futureTimeDiff / 60 < MAX_MINUTES && sameSender) {
      showTailAndAvatar = false
    }
  }

  return { showTime, showTailAndAvatar }
}

function getCssClasses(isUser, showTailAndAvatar) {
  const justifyContent = isUser
    ? 'justify-content-end'
    : 'justify-content-start'
  const contentOnly = showTailAndAvatar ? '' : ' content-only'
  const userType = isUser ? ' user' : ' counterparty'

  return { justifyContent, contentOnly, userType }
}

const UserInfo = ({ userName, userAddress }) => (
  <>
    <div className="name text-truncate align-self-center">{userName}</div>
    <span className="account">{userAddress}</span>
  </>
)

const Message = props => {
  const message = get(props, 'message', {})
  const identity = isNil(props.identity) ? {} : props.identity
  const messageContent = renderContent(message)
  const userName = abbreviateName(identity, 'Unnamed User')
  const userAddress = truncateAddress(props.wallet)
  const { showTime, showTailAndAvatar } = showItems(props)
  const { justifyContent, contentOnly, userType } = getCssClasses(
    props.isUser,
    showTailAndAvatar
  )

  return (
    <>
      {showTime && (
        <div className="timestamp">
          {dayjs.unix(message.timestamp).format('MMM Do h:mmA')}
        </div>
      )}
      <div
        className={`d-flex flex-row ${justifyContent} message${userType}${contentOnly}`}
      >
        <div className={`d-flex message-container ${justifyContent}`}>
          {!props.isUser && showTailAndAvatar && (
            <div className="align-self-end avatar-container">
              <Avatar avatar={get(props, 'identity.avatar')} size={60} />
            </div>
          )}
          <div className={`bubble ${showTailAndAvatar ? 'tail' : ''}`}>
            <div className="top">
              {props.isUser ? (
                <UserInfo userName={userName} userAddress={userAddress} />
              ) : (
                <Link
                  to={`/user/${props.wallet}`}
                  className="d-flex flex-row justify-content-start"
                >
                  <UserInfo userName={userName} userAddress={userAddress} />
                </Link>
              )}
            </div>
            <div className="content">{messageContent}</div>
          </div>
          {props.isUser && showTailAndAvatar && (
            <div className="align-self-end avatar-container">
              <Avatar avatar={get(props, 'identity.avatar')} size={60} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default withIdentity(Message)

require('react-styl')(`
  .message
    margin: 10px 0 20px 0
    flex: 1 0 auto
    width: 100%
    .message-container
      max-width: 70%
    .avatar-container
      display: inline
      .avatar
        height: 60px
        width: 60px
        display: inline-block
        vertical-align: bottom
    &.content-only
      margin-bottom: 0
    &.counterparty
      &.content-only
        padding-left: 60px
      .account, .name
        color: var(--dark-blue-grey)
    &.user
      &.content-only
        padding-right: 60px
      .account, .name
        color: white
    .bubble
      display: inline-block
      margin-left: 1.75rem
      padding: 1rem
      background-color: var(--pale-grey)
      border-radius: 1rem
      position: relative
      flex: 1
      .top
        font-size: 14px
        display: flex
        .name
          font-weight: normal
          margin-right: 0.5rem
        .account
          max-width: 6rem
          overflow: hidden
          text-overflow: ellipsis
      .content
        font-weight: normal
        font-size: 16px
        word-break: break-word
        .image-container
          overflow: auto
      &.tail::after
        content: ''
        bottom: 8px
        left: -34px
        position: absolute
        border: 0px solid
        display: block
        width: 38px
        height: 26px
        background-color: transparent
        border-bottom-left-radius: 50%
        border-bottom-right-radius: 50%
        box-shadow: 10px 11px 0px -3px var(--pale-grey)
        transform: rotate(-42deg)

    &.user
      align-self: flex-end
      flex-direction: row-reverse
      .bubble
        background-color: var(--clear-blue)
        color: var(--white)
        margin-right: 1.5rem
        &.tail::after
          right: -34px
          left: auto
          box-shadow: -10px 11px 0px -3px var(--clear-blue)
          transform: rotate(42deg)

`)
