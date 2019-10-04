import React from 'react'
import dayjs from 'dayjs'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withIdentity from 'hoc/withIdentity'
import withOffer from 'hoc/withOffer'

import Link from 'components/Link'
import Stages from 'components/TransactionStages'

function getEventText(eventName, partyName, offerTimestamp, listingTitle) {
  if (eventName === 'OfferCreated') {
    return (
      <fbt desc="EventDescription.offerCreated">
        <fbt:param name="partyName">{partyName}</fbt:param>
        made an offer on
        <fbt:param name="listingTitle">{listingTitle}</fbt:param>
        on
        <fbt:param name="offerTimestamp">{offerTimestamp}</fbt:param>
      </fbt>
    )
  } else if (eventName === 'OfferAccepted') {
    return (
      <fbt desc="EventDescription.offerAccepted">
        <fbt:param name="partyName">{partyName}</fbt:param>
        accepted an offer on
        <fbt:param name="listingTitle">{listingTitle}</fbt:param>
        on
        <fbt:param name="offerTimestamp">{offerTimestamp}</fbt:param>
      </fbt>
    )
  } else if (eventName === 'OfferFinalized') {
    return (
      <fbt desc="EventDescription.offerFinalized">
        <fbt:param name="partyName">{partyName}</fbt:param>
        finalized an offer on
        <fbt:param name="listingTitle">{listingTitle}</fbt:param>
        on
        <fbt:param name="offerTimestamp">{offerTimestamp}</fbt:param>
      </fbt>
    )
  } else if (eventName === 'OfferWithdrawn') {
    return (
      <fbt desc="EventDescription.offerWithdrawn">
        <fbt:param name="partyName">{partyName}</fbt:param>
        withdrew an offer on
        <fbt:param name="listingTitle">{listingTitle}</fbt:param>
        on
        <fbt:param name="offerTimestamp">{offerTimestamp}</fbt:param>
      </fbt>
    )
  } else if (eventName === 'OfferDisputed') {
    return (
      <fbt desc="EventDescription.offerDisputed">
        <fbt:param name="partyName">{partyName}</fbt:param>
        disputed an offer on
        <fbt:param name="listingTitle">{listingTitle}</fbt:param>
        on
        <fbt:param name="offerTimestamp">{offerTimestamp}</fbt:param>
      </fbt>
    )
  }
}

const OfferEvent = ({
  offerLoading,
  offerError,
  offer,
  event,
  wallet,
  identity,
  minimal
}) => {
  if (offerLoading) {
    return (
      <div className="offer-event">
        <fbt desc="Loading event...">Loading event...</fbt>
      </div>
    )
  }

  if (!offer || offerError) {
    console.error('OfferEvent: Failed to load offer', offerError)
    return null
  }

  const listingTitle = minimal ? (
    offer.listing.title
  ) : (
    <Link to={`/purchases/${offer.id}`}>{offer.listing.title}</Link>
  )

  const eventName = event.eventData.eventType
  const partyName = event.address === wallet ? 'You' : get(identity, 'fullName')
  const offerTimestamp = dayjs.unix(event.timestamp).format('MMM Do, YYYY')
  return (
    <>
      <div className="offer-event">
        {getEventText(eventName, partyName, offerTimestamp, listingTitle)}
      </div>
      {minimal || eventName !== 'OfferCreated' ? null : (
        <Stages offer={offer} />
      )}
    </>
  )
}

export default withOffer(
  withIdentity(OfferEvent, 'event.address'),
  'event.eventData.offerID'
)

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
