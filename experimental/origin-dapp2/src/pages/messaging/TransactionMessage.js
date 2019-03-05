import React from 'react'
import dayjs from 'dayjs'
import get from 'lodash/get'

import advancedFormat from 'dayjs/plugin/advancedFormat'

import { truncateAddress } from 'utils/user'
dayjs.extend(advancedFormat)

const TransactionMessage = props => {
  const { identity, message, userAddress } = props
  const listingTitle = get(message, 'listing.title')
  const offerTitle = get(message, 'offerTitle')
  const buyer = get(message, 'buyer.id')
  const seller = get(message, 'listing.seller.id')
  const user = get(message, 'address')
  const roomParticipant = user === buyer || user === seller

  const offerMessages = {
    createdEvent: (
      <>
        {truncateAddress(buyer)} made an offer on {listingTitle} on {dayjs.unix(message.timestamp).format('MMM Do h:mmA')}
      </>
    ),
    acceptedEvent: (
      <>
        {truncateAddress(seller)} accepted the offer for {listingTitle} on {dayjs.unix(message.timestamp).format('MMM Do h:mmA')}
      </  >
    )
  }

  if (!roomParticipant || !message) return null

  return (
    <div className="transaction-message">
      {offerMessages[offerTitle]}
    </div>
  )
}

// const { listing = {}, purchase } = this.state
// const { includeNav, users, smallScreenOrDevice, withListingSummary } = this.props
//
// if (smallScreenOrDevice || !withListingSummary) return
//
// const { returnValues = {}, event, timestamp } = info
// const partyAddress = formattedAddress(returnValues.party)
// const user = users.find((user) => formattedAddress(user.address) === partyAddress)
// const userName = abbreviateName(user)
// const party = userName || truncateAddress(returnValues.party)
// const date = formatDate(timestamp)
//
// function withdrawnOrRejected() {
//   const withdrawn = formattedAddress(purchase.buyer) === partyAddress
//   const withdrawnMessage = 'withdrew their offer for'
//   const rejectedMessage = 'rejected the offer for'
//
//   return withdrawn ? withdrawnMessage : rejectedMessage
// }
//
// const offerMessages = {
//   'OfferCreated': (
//     <FormattedMessage
//       id={'conversation.offerCreated'}
//       defaultMessage={'{party} made an offer on {name} on {date}'}
//       values={{ party, date, name: listing.name }}
//     />
//   ),
//   'OfferWithdrawn': (
//     <FormattedMessage
//       id={'conversation.offerWithdrawnOrRejected'}
//       defaultMessage={'{party} {action} {name} on {date}'}
//       values={{ party, date, name: listing.name, action: withdrawnOrRejected() }}
//     />
//   ),
//   'OfferAccepted': (
//     <FormattedMessage
//       id={'conversation.offerAccepted'}
//       defaultMessage={'{party} accepted the offer for {name} on {date}'}
//       values={{ party, date, name: listing.name }}
//     />
//   ),
//   'OfferDisputed': (
//     <FormattedMessage
//       id={'conversation.offerDisputed'}
//       defaultMessage={'{party} initiated a dispute for {name} on {date}'}
//       values={{ party, date, name: listing.name }}
//     />
//   ),
//   'OfferRuling': (
//     <FormattedMessage
//       id={'conversation.offerRuling'}
//       defaultMessage={'{party} made a ruling on the dispute for {name} on {date}'}
//       values={{ party, date, name: listing.name }}
//     />
//   ),
//   'OfferFinalized': (
//     <FormattedMessage
//       id={'conversation.offerFinalized'}
//       defaultMessage={'{party} finalized the offer for {name} on {date}'}
//       values={{ party, date, name: listing.name }}
//     />
//   ),
//   'OfferData': (
//     <FormattedMessage
//       id={'conversation.offerData'}
//       defaultMessage={'{party} updated information for {name} on {date}'}
//       values={{ party, date, name: listing.name }}
//     />
//   ),
// }
//
// return (
//   <div key={new Date() + Math.random()} className="purchase-info">
//     {includeNav && (
//       <Link to={`/purchases/${purchase.id}`} target="_blank" rel="noopener noreferrer">
//         {offerMessages[event]}
//       </Link>
//     )}
//     {!includeNav && offerMessages[event]}
//   </div>
// )

export default TransactionMessage

require('react-styl')(`
  .transaction-message
    color: var(--bluey-grey)
    font-style: italic
    text-align: center
    padding-top: 15px
    padding-bottom: 15px
`)
