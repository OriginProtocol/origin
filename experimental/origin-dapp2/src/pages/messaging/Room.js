import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import query from 'queries/Room'
import SendMessage from './SendMessage'
import Avatar from 'components/Avatar'
import QueryError from 'components/QueryError'

dayjs.extend(advancedFormat)

function renderContent(message) {
  const { content, media } = message
  const contentWithLineBreak = `${content}\n`

  if (!media || !media.length) {
    return contentWithLineBreak
  } else {
    return media.map(image => (
      <div key={image.url} className="image-container mx-auto">
        <img src={image.url} alt={'fileName'} />
      </div>
    ))
  }
}

const Message = props => {
  const message = get(props, 'message', {})
  const name = get(props, 'identity.fullName', '')
  const messageContent = renderContent(message)
  const isUser = props.isUser ? ' user' : ''

  let showTime = true
  if (props.lastMessage) {
    const timeDiff = message.timestamp - props.lastMessage.timestamp
    if (timeDiff < 60 * 5) showTime = false
  }
  return (
    <>
      {showTime && (
        <div className="timestamp">
          {dayjs.unix(message.timestamp).format('MMM Do h:mmA')}
        </div>
      )}
      <div className={`message${isUser}`}>
        {!isUser && <Avatar avatar={get(props, 'identity.avatar')} size={60} />}
        <div className="bubble">
          <div className="top">
            {name && <div className="name">{name}</div>}
            <div className="account">{message.address}</div>
          </div>
          <div className="content">{messageContent}</div>
        </div>
        {isUser && <Avatar avatar={get(props, 'identity.avatar')} size={60} />}
      </div>
    </>
  )
}

const MessageWithIdentity = withIdentity(Message)

class AllMessages extends Component {
  componentDidMount() {
    if (this.el) {
      this.el.scrollTop = this.el.scrollHeight
    }
    if (this.props.markRead) {
      this.props.markRead()
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.messages.length !== prevProps.messages.length) {
      this.el.scrollTop = this.el.scrollHeight
      if (this.props.markRead) {
        this.props.markRead()
      }
    }
    if (this.props.markRead && this.props.convId !== prevProps.convId) {
      this.props.markRead()
    }
  }
  render() {
    const { messages } = this.props

    return (
      <div className="messages" ref={el => (this.el = el)}>
        {messages.map((message, idx) => (
          <MessageWithIdentity
            message={message}
            lastMessage={idx > 0 ? messages[idx - 1] : null}
            key={idx}
            wallet={get(message, 'address')}
            isUser={this.props.wallet === get(message, 'address')}
          />
        ))}
      </div>
    )
  }
}

class Room extends Component {
  render() {
    const { id, wallet, markRead } = this.props
    return (
      <div className="container">
        <Query
          query={query}
          pollInterval={2000}
          variables={{ id }}
          skip={!id}
          notifyOnNetworkStatusChange={true}
        >
          {({ error, data, networkStatus }) => {
            if (networkStatus === 1) {
              return <div>Loading...</div>
            } else if (error) {
              return <QueryError query={query} error={error} />
            } else if (!data || !data.messaging) {
              return <p className="p-3">Cannot query messages</p>
            }

            const messages = get(data, 'messaging.conversation.messages', [])
            return (
              <>
                <AllMessages
                  messages={messages}
                  wallet={wallet}
                  convId={id}
                  markRead={() => markRead({ variables: { id } })}
                />
                <SendMessage to={this.props.id} />
              </>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default withWallet(Room)

require('react-styl')(`
  .messages-page .messages
    max-height: calc(100vh - 10.25rem)
    overflow: auto
    display: flex
    flex-direction: column
    align-items: start
    .image-container
      img
        max-height: 250px
        max-width: 165px
    .timestamp
      color: var(--bluey-grey)
      font-size: 12px;
      align-self: center
      margin-bottom: 1rem
    .message
      margin: 20px 0
      .avatar
        height: 60px
        width: 60px
        display: inline-block
        vertical-align: bottom
      .bubble
        display: inline-block
        margin-left: 1.75rem
        padding: 1rem
        background-color: var(--pale-grey)
        border-radius: 1rem
        position: relative
        max-width: 70%
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
        &::after
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
          &::after
            right: -34px
            left: auto
            box-shadow: -10px 11px 0px -3px var(--clear-blue)
            transform: rotate(42deg)

`)
