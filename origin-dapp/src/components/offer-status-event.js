import React, { Component } from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'

class OfferStatusEvent extends Component {
  render() {
    const { buyer, events, status } = this.props.offer || {}
    let event

    switch (status) {
    case 'created':
      event = events.find(({ event }) => event === 'OfferCreated')

      return (
        <FormattedMessage
          id={'offer-status-event.created'}
          defaultMessage={'Offer made on {date}'}
          values={{
            date: (
              <FormattedDate
                value={event.timestamp * 1000}
                day="numeric"
                month="long"
                year="numeric"
              />
            )
          }}
        />
      )
    case 'accepted':
      event = events.find(({ event }) => event === 'OfferAccepted')

      return (
        <FormattedMessage
          id={'offer-status-event.accepted'}
          defaultMessage={'Offer accepted on {date}'}
          values={{
            date: (
              <FormattedDate
                value={event.timestamp * 1000}
                day="numeric"
                month="long"
                year="numeric"
              />
            )
          }}
        />
      )
    case 'withdrawn':
      event = events.find(({ event }) => event === 'OfferWithdrawn')

      const actor = event ? event.returnValues.party : null

      return actor === buyer ? (
        <FormattedMessage
          id={'offer-status-event.withdrawn'}
          defaultMessage={'Offer withdrawn on {date}'}
          values={{
            date: (
              <FormattedDate
                value={event.timestamp * 1000}
                day="numeric"
                month="long"
                year="numeric"
              />
            )
          }}
        />
      ) : (
        <FormattedMessage
          id={'offer-status-event.rejected'}
          defaultMessage={'Offer rejected on {date}'}
          values={{
            date: (
              <FormattedDate
                value={event.timestamp * 1000}
                day="numeric"
                month="long"
                year="numeric"
              />
            )
          }}
        />
      )
    case 'disputed':
      event = events.find(({ event }) => event === 'OfferDisputed')

      return (
        <FormattedMessage
          id={'offer-status-event.disputed'}
          defaultMessage={'Dispute started on {date}'}
          values={{
            date: (
              <FormattedDate
                value={event.timestamp * 1000}
                day="numeric"
                month="long"
                year="numeric"
              />
            )
          }}
        />
      )
    case 'ruling':
      event = events.find(({ event }) => event === 'OfferRuling')

      return (
        <FormattedMessage
          id={'offer-status-event.ruling'}
          defaultMessage={'Ruling made on {date}'}
          values={{
            date: (
              <FormattedDate
                value={event.timestamp * 1000}
                day="numeric"
                month="long"
                year="numeric"
              />
            )
          }}
        />
      )
    case 'finalized':
      event = events.find(({ event }) => event === 'OfferFinalized')

      return (
        <FormattedMessage
          id={'offer-status-event.finalized'}
          defaultMessage={'Sale completed on {date}'}
          values={{
            date: (
              <FormattedDate
                value={event.timestamp * 1000}
                day="numeric"
                month="long"
                year="numeric"
              />
            )
          }}
        />
      )
    case 'sellerReviewed':
      event = events.find(({ event }) => event === 'OfferData')

      return (
        <FormattedMessage
          id={'offer-status-event.reviewed'}
          defaultMessage={'Sale reviewed on {date}'}
          values={{
            date: (
              <FormattedDate
                value={event.timestamp * 1000}
                day="numeric"
                month="long"
                year="numeric"
              />
            )
          }}
        />
      )
    default:
      return (
        <FormattedMessage
          id={'offer-status-event.unknown'}
          defaultMessage={'Offer status unknown'}
        />
      )
    }
  }
}

export default OfferStatusEvent
