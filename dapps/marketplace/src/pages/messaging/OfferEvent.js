import React from 'react'
import dayjs from 'dayjs'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withIdentity from 'hoc/withIdentity'

import Link from 'components/Link'
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

const OfferEvent = ({ event, wallet, identity, minimal }) => {
  const offerTitle = minimal ? event.offer.listing.title : (
    <Link to={`/purchases/${event.offer.id}`}>
      {event.offer.listing.title}
    </Link>
  )

  return (
    <>
      <div className="offer-event">
        {event.address === wallet
          ? 'You'
          : get(identity, 'fullName')}
        {` ${eventName(event.eventData.eventType)} `}
        {offerTitle}
        {` on ${dayjs.unix(event.timestamp).format('MMM Do, YYYY')}`}
      </div>
      {minimal || event.eventData.eventType !== 'OfferCreated' ? null : (
        <Stages offer={event.offer} />
      )}
    </>
  )
}

export default withIdentity(OfferEvent, 'event.address')

require('react-styl')(`
  .messages-page .messages
    .offer-event
      color: var(--bluey-grey)
      font-size: 18px
      font-style: italic
      align-self: center
      margin-bottom: 1rem
      font-weight: normal
`)
