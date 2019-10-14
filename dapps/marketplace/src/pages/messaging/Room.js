import React, { Component } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import withRoom from 'hoc/withRoom'

import query from 'queries/Room'
import SendMessage from './SendMessage'
import MessageWithIdentity from './Message'
import QueryError from 'components/QueryError'
import EnableMessaging from 'components/EnableMessaging'
import LoadingSpinner from 'components/LoadingSpinner'

import TopScrollListener from 'components/TopScrollListener'

import OfferEvent from './OfferEvent'

const isOfferEventsDisabled = () => {
  return get(window, 'localStorage.disableOfferEvents', 'false') === 'true'
}

class AllMessages extends Component {
  state = {
    ready: false
  }

  componentDidMount() {
    this.shouldScrollToBottom()

    if (this.props.markRead) {
      this.props.markRead()
    }
  }

  componentWillUnmount() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.convId === this.props.convId) {
      return
    }

    this.shouldScrollToBottom()

    if (this.props.markRead) {
      this.props.markRead()
    }
  }

  shouldScrollToBottom() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout)
    }

    this.scrollTimeout = setTimeout(() => this.scrollToBottom(), 100)
  }

  scrollToBottom() {
    if (!this.el) {
      return
    }
    this.el.scrollTop = this.el.scrollHeight

    if (!this.state.ready) {
      this.setState({
        ready: true
      })
    }
  }

  onTopListener() {
    const { messages, fetchMore } = this.props

    if (this.state.ready && messages && messages.length && fetchMore) {
      fetchMore({
        before: messages[messages.length - 1].index
      })
    }
  }

  render() {
    const { messages, hasMore, isLoadingMore, wallet } = this.props

    if (!messages || messages.length === 0) {
      return (
        <div className="no-conversation">
          <fbt desc="Room.noMessage">
            You haven&apos;t started a conversation with this user
          </fbt>
        </div>
      )
    }

    return (
      <TopScrollListener
        onTop={() => {
          this.onTopListener()
        }}
        hasMore={hasMore}
        ready={this.state.ready}
        onInnerRef={el => (this.el = el)}
        className="messages"
      >
        <>
          {messages.map((message, idx) => {
            if (message.type === 'event') {
              if (isOfferEventsDisabled()) {
                return null
              }

              return (
                <OfferEvent
                  key={`event-${message.index}`}
                  event={message}
                  wallet={wallet}
                />
              )
            }
            return (
              <MessageWithIdentity
                message={message}
                lastMessage={
                  messages.length - 1 === idx ? null : messages[idx + 1]
                }
                nextMessage={idx > 0 ? messages[idx - 1] : null}
                key={`message-${message.index}`}
                wallet={get(message, 'address')}
                isUser={wallet === get(message, 'address')}
              />
            )
          })}
          {isLoadingMore && (
            <div className="messages-loading-spinner">
              <fbt desc="Loading...">Loading...</fbt>
            </div>
          )}
        </>
      </TopScrollListener>
    )
  }
}

const Room = props => {
  const { id, wallet, markRead, enabled } = props

  const { roomFetchMore, room, roomError, roomLoading, roomLoadingMore } = props

  const messages = get(room, 'messages', [])
  const hasMore = get(room, 'hasMore', false)

  if (roomLoading && !messages.length) {
    return <LoadingSpinner />
  } else if (roomError) {
    return <QueryError query={query} error={roomError} />
  }

  return (
    <>
      <AllMessages
        messages={messages}
        wallet={wallet}
        convId={id}
        markRead={() => markRead({ variables: { id } })}
        hasMore={hasMore}
        fetchMore={args => roomFetchMore(args)}
        isLoadingMore={roomLoadingMore}
      />
      {enabled ? (
        <SendMessage to={props.id} />
      ) : (
        <div className="enable-messaging-action">
          <EnableMessaging />
        </div>
      )}
    </>
  )
}

export default withWallet(withRoom(Room))

require('react-styl')(`
  .messages-page .messages
    flex: 1
    overflow-y: scroll
    overflow-x: hidden
    display: flex
    flex-direction: column-reverse
    align-items: start
    .image-container
      img
        max-height: 250px
        max-width: 165px
    .timestamp
      color: var(--bluey-grey)
      font-size: 10px
      text-align: center
      align-self: center
      margin-top: 1rem
    .stages
      min-height: 4rem
    .messages-loading-spinner
      color: var(--bluey-grey)
      font-style: italic
      text-align: center
      display: block
      width: 100%
  .no-conversation
    color: var(--bluey-grey)
    font-style: italic
    flex: 1
    align-items: center
    display: flex
    width: 100%
    justify-content: center
  .enable-messaging-action
    width: 100%
    flex: auto 0 0
`)
