import React from 'react'
import dayjs from 'dayjs'
import get from 'lodash/get'

import advancedFormat from 'dayjs/plugin/advancedFormat'

import { truncateAddress } from 'utils/user'
dayjs.extend(advancedFormat)

function withdrawnOrRejected(buyer, seller, withdrawnBy) {
  const withdrawnMessage = `${truncateAddress(
    withdrawnBy
  )} withdrew their offer for`
  const rejectedMessage = `${truncateAddress(
    withdrawnBy
  )} rejected the offer for`

  return withdrawnBy === buyer ? withdrawnMessage : rejectedMessage
}

const TransactionMessage = props => {
  const { message } = props
  const listingTitle = get(message, 'listing.title')
  const offerTitle = get(message, 'offerTitle')
  const buyer = get(message, 'buyer.id')
  const seller = get(message, 'listing.seller.id')

  const date = dayjs.unix(message.timestamp).format('MMM Do h:mmA')
  const withdrawnBy = get(message, 'withdrawnBy.id')
  const arbitrator = get(message, 'listing.arbitrator.id')

  const offerMessages = {
    createdEvent: (
      <>
        {truncateAddress(buyer)} made an offer on {listingTitle} on {date}
      </>
    ),
    acceptedEvent: (
      <>
        {truncateAddress(seller)} accepted the offer for {listingTitle} on{' '}
        {date}
      </>
    ),
    withdrawnEvent: (
      <>
        {withdrawnOrRejected(buyer, seller, withdrawnBy)} {listingTitle} on{' '}
        {date}
      </>
    ),
    disputedEvent: (
      <>
        A dispute has been initiated for {listingTitle} on {date}
      </>
    ),
    rulingEvent: (
      <>
        {truncateAddress(arbitrator)} made a ruling on the dispute for{' '}
        {listingTitle} on {date}
      </>
    ),
    finalizedEvent: (
      <>
        {truncateAddress(buyer)} finalized the offer for {listingTitle} on{' '}
        {date}
      </>
    )
  }

  if (!message) return null

  return (
    <div className="transaction-message align-self-center">
      {offerMessages[offerTitle]}
    </div>
  )
}

export default TransactionMessage

require('react-styl')(`
  .transaction-message
    color: var(--bluey-grey)
    text-align: center
    font-style: italic
    padding-top: 15px
    padding-bottom: 15px
`)
