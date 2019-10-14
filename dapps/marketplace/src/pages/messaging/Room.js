import React, { Component, useEffect, useState, useCallback } from 'react'
import { useQuery, useSubscription } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'

import query from 'queries/Room'
import subscription from 'queries/NewMessageSubscription'
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
    const { messages } = this.props

    return (
      <TopScrollListener
        onTop={() => {
          this.onTopListener()
        }}
        hasMore={this.props.hasMore}
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
                  wallet={this.props.wallet}
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
                isUser={this.props.wallet === get(message, 'address')}
              />
            )
          })}
        </>
      </TopScrollListener>
    )
  }
}

const Room = props => {
  const { id, wallet, markRead, enabled } = props

  console.log(props)

  // Query for initial data
  const {
    error,
    data,
    networkStatus,
    fetchMore,
    subscribeToMore,
    refetch
  } = useQuery(query, {
    variables: { id },
    skip: !id,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only'
  })

  const isLoading = networkStatus === 1

  const messages = get(data, 'messaging.conversation.messages', [])
  const hasMore = get(data, 'messaging.conversation.hasMore', false)

  useEffect(() => {
    // Subscribe to New messages
    subscribeToMore({
      document: subscription,
      updateQuery: (prev, { subscriptionData }) => {
        const { conversationId, message } = subscriptionData.data.messageAdded
        let newMessages = get(prev, 'messaging.conversation.messages', [])

        if (id === conversationId) {
          newMessages = [message, ...newMessages]
        }

        return {
          ...prev,
          messaging: {
            ...prev.messaging,
            conversation: {
              ...prev.messaging.conversation,
              messages: [...newMessages]
            }
          }
        }
      }
    })
  }, [id])

  useEffect(() => {
    refetch()
  }, [props.enabled])

  const fetchMoreCallback = useCallback(
    ({ before }) => {
      // Fetch more
      fetchMore({
        variables: {
          id,
          before
        },
        updateQuery: (prevData, { fetchMoreResult }) => {
          const newMessages = fetchMoreResult.messaging.conversation.messages

          return {
            ...prevData,
            messaging: {
              ...prevData.messaging,
              conversation: {
                ...prevData.messaging.conversation,
                messages: newMessages
              }
            }
          }
        }
      })
    },
    [id]
  )

  if (isLoading && !messages.length) {
    return <LoadingSpinner />
  } else if (error) {
    return <QueryError query={query} error={error} />
  } else if (!isLoading && !messages.length) {
    return (
      <p className="p-3">
        <fbt desc="Room.noMessage">You have no messages in your inbox</fbt>
      </p>
    )
  }

  return (
    <>
      <AllMessages
        messages={messages}
        wallet={wallet}
        convId={id}
        markRead={() => markRead({ variables: { id } })}
        hasMore={hasMore}
        fetchMore={args => fetchMoreCallback(args)}
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

export default withWallet(Room)

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
  .enable-messaging-action
    width: 100%
    flex: auto 0 0
`)
