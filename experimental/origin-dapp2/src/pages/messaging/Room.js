import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import find from 'lodash/find'
import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import pick from 'lodash/pick'
import last from 'lodash/last'

import withWallet from 'hoc/withWallet'
import withOffers from 'hoc/withOffers'
import withPurchases from 'hoc/withPurchases'
import withIdentity from 'hoc/withIdentity'

import OfferEvents from 'queries/OfferEvents'
import query from 'queries/Room'
import SendMessage from './SendMessage'
import Message from './Message'
import QueryError from 'components/QueryError'

const eventKeys = [
  'createdEvent',
  'acceptedEvent',
  'disputedEvent',
  'rulingEvent',
  'finalizedEvent'
]

function getRoomEvents(offers, purchases, { address }) {
  return filter([...offers, ...purchases], offer => {
    const seller = get(offer, 'listing.seller.id')
    const buyer = get(offer, 'buyer.id')

    return buyer === address || seller === address
  })
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
    const {
      messages,
      offers = [],
      purchases = [],
      wallet,
      offerEvents,
      purchaseEvents = []
    } = this.props
    const counterparty = find(
      messages,
      ({ address }) => address !== wallet
    ) || { address: this.props.wallet }
    const roomEvents =
      getRoomEvents(offerEvents, purchaseEvents, counterparty) || []

    const transactionMessages = roomEvents.map(event => {
      return { ...event, timestamp: get(event, 'offerEvent.timestamp') }
    })
    const combinedMessages = sortBy(
      [...messages, ...transactionMessages],
      'timestamp'
    )

    return (
      <div className="messages" ref={el => (this.el = el)}>
        {combinedMessages.map((message, idx) => {
          return (
            <MessageWithIdentity
              message={message}
              lastMessage={idx > 0 ? messages[idx - 1] : null}
              nextMessage={messages[idx + 1]}
              key={idx}
              wallet={get(message, 'address')}
              isUser={wallet === get(message, 'address')}
            />
          )
        })}
      </div>
    )
  }
}

// class MessagesWithOfferEvents extends Component {
//   render() {
//     const { messages, offers = [], purchases = [], wallet } = this.props
//     const counterparty = find(messages, ({ address }) => address !== wallet) || { address: this.props.wallet }
//     const offerEvents = getRoomEvents(offers, purchases, counterparty) || []
//     const transactionMessages = offerEvents.map((offer) => {
//       return { ...offer, timestamp: get(offer, 'createdEvent.timestamp') }
//     })
//     const offerIds = offerEvents.map((offer) => pick(offer, 'offerId'))
//     const combinedMessages = sortBy([...messages, ...transactionMessages], 'timestamp')
//     const offerId = get(last(offerIds), 'offerId')
//     return (
//       <Query
//         query={OfferEvents}
//         variables={{ offerId }}
//         skip={!offerId}
//         notifyOnNetworkStatusChange={true}
//       >
//       {({ data }) => {
//         console.log("DATA", data, offerIds)
//         return null
//       }}
//       </Query>
//     )
//   }
// }

const MessagesWithOffers = withOffers(AllMessages)

class Room extends Component {
  render() {
    const { id, wallet, markRead, purchaseEvents = [] } = this.props
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
                <MessagesWithOffers
                  messages={messages}
                  wallet={wallet}
                  convId={id}
                  markRead={() => markRead({ variables: { id } })}
                  purchaseEvents={purchaseEvents}
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

export default withWallet(withPurchases(Room))

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
