import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import { fbt } from 'fbt-runtime'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withIsMobile from 'hoc/withIsMobile'
import withMessaging from 'hoc/withMessaging'
import query from 'queries/Conversations'
import MarkConversationRead from 'mutations/MarkConversationRead'

import RoomStatus from './RoomStatus'
import Room from './Room'
import QueryError from 'components/QueryError'
import Avatar from 'components/Avatar'
import DocumentTitle from 'components/DocumentTitle'

import MobileModal from 'components/MobileModal'

import { abbreviateName, truncateAddress } from 'utils/user'
import LoadingSpinner from 'components/LoadingSpinner'

import RefetchOnMessageData from 'pages/messaging/RefetchOnMessageData'

import BottomScrollListener from 'components/BottomScrollListener'

const RoomTitle = withIdentity(({ identity, walletProxy }) => (
  <Link to={`/user/${walletProxy}`} className="user-profile-link">
    <Avatar profile={identity} size={30} />
    <span className="counterparty">
      {abbreviateName(identity) || truncateAddress(walletProxy)}
    </span>
  </Link>
))

const ConversationList = ({
  isMobile,
  messagingError,
  messaging,
  messagingLoading,
  room,
  onBack,
  messagingFetchMore,
  messagingNetworkStatus,
  wallet,
  messagingKeysLoading
}) => {
  const [markConversationRead] = useMutation(MarkConversationRead)
  const [hasMore, setHasMore] = useState(true)

  const conversations = get(messaging, 'conversations', [])

  if (messagingError) {
    return <QueryError query={query} error={messagingError} />
  } else if (
    (messagingLoading && !conversations.length) ||
    messagingKeysLoading
  ) {
    return <LoadingSpinner />
  } else if (!messagingLoading && !messaging) {
    return (
      <p className="p-3">
        <fbt desc="Messages.no Message">You have no messages</fbt>
      </p>
    )
  }

  let content = !room ? null : (
    <div className="conversation-view">
      <Room
        id={room}
        markRead={markConversationRead}
        enabled={messaging.enabled}
      />
    </div>
  )

  if (content && isMobile) {
    content = (
      <MobileModal
        className="messages-page messages-modal"
        title={<RoomTitle walletProxy={room} wallet={room} />}
        onBack={onBack}
      >
        <div className="conversations-wrapper">{content}</div>
      </MobileModal>
    )
  }

  return (
    <div className="conversations-wrapper">
      <BottomScrollListener
        className="conversations-list"
        ready={messaging.enabled && messagingNetworkStatus === 7}
        bindOnContainer={true}
        hasMore={hasMore}
        onBottom={() => {
          messagingFetchMore({
            variables: {
              offset: conversations.length
            },
            updateQuery: (prevData, { fetchMoreResult }) => {
              const convs = fetchMoreResult.messaging.conversations

              if (convs.length === 0) {
                setHasMore(false)
              }

              return {
                ...prevData,
                messaging: {
                  ...prevData.messaging,
                  conversations: [...prevData.messaging.conversations, ...convs]
                }
              }
            }
          })
        }}
      >
        <>
          {conversations.length ? null : (
            <div>
              <fbt desc="Messages.none">No conversations!</fbt>
            </div>
          )}
          {conversations.map((conv, idx) => (
            <RoomStatus
              key={idx}
              active={room === conv.id}
              conversation={conv}
              wallet={wallet}
            />
          ))}
        </>
      </BottomScrollListener>
      {content}
    </div>
  )
}

const Messages = props => {
  const [defaultRoom, setDefaultRoom] = useState(false)
  const [back, setBack] = useState(false)

  const room = get(props, 'match.params.room')
  useEffect(() => {
    // To set a default room
    if (
      defaultRoom ||
      back ||
      !props.messaging ||
      room ||
      props.isMobile ||
      props.messagingLoading
    ) {
      return
    }

    const conversations = get(props, 'messaging.conversations', [])
    const defaultRoom = get(conversations, '0.id')

    if (defaultRoom) {
      props.history.push(`/messages/${defaultRoom}`)
      setDefaultRoom(true)
    }
  }, [
    room,
    defaultRoom,
    back,
    props.messaging,
    props.isMobile,
    props.messagingLoading
  ])

  return (
    <div className="container messages-page">
      <DocumentTitle pageTitle={<fbt desc="Messages.title">Messages</fbt>} />
      <RefetchOnMessageData refetch={props.messagingRefetch} />
      <ConversationList
        {...props}
        room={room}
        onBack={() => {
          setBack(true)
          props.history.goBack()
        }}
      />
    </div>
  )
}

export default withIsMobile(withWallet(withMessaging(Messages)))

require('react-styl')(`
  .messages-page
    margin-top: 1rem
    .back
      background-color: var(--dusk)
      height: 60px
      width: 100%
      margin-bottom: 10px
      margin-top: -16px

      .avatar
        margin: 0 10px 12px auto
        align-self: center
        display: inline-block
        vertical-align: bottom
      .avatar-container
        height: 30px
        width: 30px

      i
        width: 18px
        height: 18px
        border-radius: 3px
        border: solid white
        border-width: 0 4px 4px 0
        display: inline-block
        padding: 3px

        &.icon-arrow-left
          margin-left: 18px
          margin-top: 20px
          transform: rotate(135deg)
          -webkit-transform: rotate(135deg)

      .counterparty
        margin-right: auto
        font-size: 22px
        font-weight: bold
        color: white
        margin-bottom: 5px
        width: 200px
        text-align: left
        line-height: 57px

      a
        color: white

      &:hover
        color: white

    .conversations-wrapper
      display: flex
      flex-direction: row
      height: calc(100vh - 6rem)
      .conversations-list
        flex: 1
        overflow-y: scroll
        -webkit-overflow-scrolling: touch
        overflow-x: hidden
      .conversation-view
        flex: 3
        overflow-y: scroll
        overflow-x: hidden
        padding: 0 2rem
        display: flex
        -webkit-overflow-scrolling: touch
        flex-direction: column

  .mobile-modal-light
    .messages-modal
      margin: 0
      &.modal-content
        min-height: auto
        .messages
          padding: 0 1rem
        .send-message
          margin-bottom: 1rem
          padding: 1rem 1rem 0rem 1rem
          margin-top: auto

        .conversations-wrapper
          height: 100%
          flex: 1
        .conversation-view
          padding: 0
      &.modal-header
        .user-profile-link
          display: inline-block
          .avatar
            display: inline-block
            vertical-align: middle
            margin-right: 0.5rem
          .counterparty
            color: var(--dark-blue-grey)

`)
