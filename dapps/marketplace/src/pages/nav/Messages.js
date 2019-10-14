import React, { useEffect } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import withConversations from 'hoc/withConversations'

import Dropdown from 'components/Dropdown'
import Link from 'components/Link'
import EnableMessaging from 'components/EnableMessaging'
import RoomStatus from 'pages/messaging/RoomStatus'

const MessagesNav = ({ open, onClose, onOpen, ...props }) => {
  const { messaging, wallet, messagingNetworkStatus, messagingRefetch } = props

  useEffect(() => {
    // Rerender on wallet or messaging status change
    if (
      wallet &&
      messagingNetworkStatus !== 1 &&
      messagingNetworkStatus !== 4
    ) {
      messagingRefetch()
    }
  }, [wallet])

  const totalUnread = get(messaging, 'totalUnread', 0)
  const hasUnread = totalUnread > 0 ? ' active' : ''

  return (
    <>
      <Dropdown
        el="li"
        className="nav-item messages d-none d-md-flex"
        open={open}
        onClose={() => onClose()}
        content={
          <MessagesDropdown
            onClick={() => onClose()}
            totalUnread={totalUnread}
            wallet={wallet}
            {...props}
          />
        }
      >
        <a
          className="nav-link"
          href="#"
          onClick={e => {
            e.preventDefault()
            open ? onClose() : onOpen()
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <div className={`messages-icon${hasUnread}`} />
        </a>
      </Dropdown>
    </>
  )
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

const MessagesDropdown = ({
  onClick,
  totalUnread,
  messaging,
  messagingEnabled,
  messagingKeysLoading,
  messagingError,
  wallet,
  messagingNetworkStatus
}) => {
  if (messagingError) {
    console.error(messagingError)
    return <Error />
  } else if (messagingKeysLoading || messagingNetworkStatus === 1) {
    return <Loading />
  }

  const conversations = get(messaging, 'conversations', []).slice(0, 5)

  return (
    <>
      <div className="dropdown-menu dropdown-menu-right show">
        {messagingEnabled && totalUnread <= 0 ? null : (
          <div className="count">
            {totalUnread <= 0 ? null : (
              <>
                <div className="total">{totalUnread}</div>
                <div className="title">
                  <fbt desc="messages.unreadMessages">
                    Unread
                    <fbt:plural count={totalUnread} showCount="no">
                      Message
                    </fbt:plural>
                  </fbt>
                </div>
              </>
            )}
            {messagingEnabled ? null : (
              <EnableMessaging className="btn-sm" onClose={onClick} />
            )}
          </div>
        )}
        <div className="messaging-dropdown-content">
          {conversations.map((conv, idx) => (
            <RoomStatus
              onClick={onClick}
              key={idx}
              conversation={conv}
              wallet={wallet}
            />
          ))}
        </div>
        <Link to="/messages" onClick={() => onClick()}>
          <fbt desc="messages.viewMessages">View Messages</fbt>
        </Link>
      </div>
    </>
  )
}

export default withWallet(withConversations(MessagesNav))

// Shares some styles with ./Notifications.js
require('react-styl')(`
  .navbar .nav-item.messages
    .messages-icon
      width: 2.2rem
      height: 1.6rem
      background: url(images/messages-icon-selected.svg) no-repeat center
      background-size: contain
      position:relative
      &.active
        &::after
          content: ""
          width: 14px
          height: 14px
          background: var(--greenblue)
          border-radius: 10px
          border: 2px solid var(--white)
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
