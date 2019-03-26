import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'

import query from 'queries/Room'
import SendMessage from './SendMessage'
import MessageWithIdentity from './Message'
import QueryError from 'components/QueryError'
import EnableMessaging from 'components/EnableMessaging'

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
            nextMessage={messages[idx + 1]}
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
    const { id, wallet, markRead, enabled } = this.props
    return (
      <div className="container">
        <Query
          query={query}
          pollInterval={500}
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
              return (
                <p className="p-3">
                  <fbt desc="Room.cannotQuery">Cannot query messages</fbt>
                </p>
              )
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
                {enabled ? (
                  <SendMessage to={this.props.id} />
                ) : (
                  <div className="col-12">
                    <EnableMessaging />
                  </div>
                )}
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
`)
