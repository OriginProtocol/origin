import React, { Component } from 'react'
import { Query } from 'react-apollo'
import dayjs from 'dayjs'
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withCounterpartyEvents from 'hoc/withCounterpartyEvents'

import query from 'queries/Room'
import SendMessage from './SendMessage'
import MessageWithIdentity from './Message'
import Link from 'components/Link'
import QueryError from 'components/QueryError'
import EnableMessaging from 'components/EnableMessaging'
import Stages from 'components/TransactionStages'

function eventName(name) {
  if (name === 'OfferCreated') {
    return fbt('made an offer', 'EventDescription.offerCreated')
  } else if (name === 'OfferAccepted') {
    return fbt('accepted an offer on', 'EventDescription.offerAccepted')
  } else if (name === 'OfferFinalized') {
    return fbt('finalized an offer on', 'EventDescription.offerFinalized')
  } else if (name === 'OfferWithdrawn') {
    return fbt('withdrew an offer on', 'EventDescription.offerWithdrawn')
  } else if (name === 'OfferDisputed') {
    return fbt('disputed an offer on', 'EventDescription.offerDisputed')
  }
}

const OfferEvent = ({ event, wallet, identity }) => (
  <>
    <div className="offer-event">
      {event.event.returnValues.party === wallet
        ? 'You'
        : get(identity, 'fullName')}
      {` ${eventName(event.event.event)} `}
      <Link to={`/purchases/${event.offer.id}`}>
        {event.offer.listing.title}
      </Link>
      {` on ${dayjs.unix(event.event.timestamp).format('MMM Do, YYYY')}`}
    </div>
    {event.event.event !== 'OfferCreated' ? null : (
      <Stages offer={event.offer} />
    )}
  </>
)

const OfferEventWithIdentity = withIdentity(
  OfferEvent,
  'event.event.returnValues.party'
)

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
    const messages = this.props.messages.map(message => ({
      message,
      timestamp: message.timestamp
    }))
    const events = this.props.events.map(event => ({
      event,
      timestamp: event.event.timestamp
    }))
    const items = sortBy([...messages, ...events], ['timestamp'])

    return (
      <div className="messages" ref={el => (this.el = el)}>
        {this.props.eventsLoading ? (
          <div className="offer-event">Loading Events...</div>
        ) : null}
        {items.map((item, idx) => {
          const { message, event } = item
          if (message) {
            return (
              <MessageWithIdentity
                message={message}
                lastMessage={idx > 0 ? messages[idx - 1] : null}
                nextMessage={messages[idx + 1]}
                key={idx}
                wallet={get(message, 'address')}
                isUser={this.props.wallet === get(message, 'address')}
              />
            )
          } else if (event) {
            return (
              <OfferEventWithIdentity
                key={idx}
                event={event}
                wallet={this.props.wallet}
              />
            )
          }
        })}
      </div>
    )
  }
}

class Room extends Component {
  render() {
    const { id, wallet, markRead, enabled, counterpartyEvents } = this.props
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
                  events={counterpartyEvents}
                  eventsLoading={this.props.counterpartyEventsLoading}
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

export default withWallet(withCounterpartyEvents(Room))

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
    .offer-event
      color: var(--bluey-grey)
      font-size: 18px
      font-style: italic
      align-self: center
      margin-bottom: 1rem
      font-weight: normal
    .stages
      min-height: 4rem
`)
