import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'
import withOfferEvents from 'hoc/withOfferEvents'

import query from 'queries/Room'
import SendMessage from './SendMessage'
import MessageWithIdentity from './Message'
import QueryError from 'components/QueryError'

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
    const { id, wallet, markRead, offers = [] } = this.props
    console.log("WHATS ALL IN THE ROOM?", this.props)
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
            const transactionMessages = offers.map((offer) => {
              return { ...offer, timestamp: get(offer, 'createdEvent.timestamp') }
            })
            return (
              <>
                <AllMessages
                  messages={[...messages, ...transactionMessages]}
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

export default withWallet(withOfferEvents(Room))

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
