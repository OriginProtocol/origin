import React from 'react'
import dayjs from 'dayjs'
import get from 'lodash/get'

import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(advancedFormat)

const TransactionMessage = props => {
  const { identity, message, timestamp, wallet } = props
  const listingTitle = get(message, 'listing.title')
  const offerTitle = get(message, 'offerTitle')
  const buyer = get(message, 'buyer.id')
  const seller = get(message, 'listing.seller.id')
  const party = wallet === (buyer || seller)

  const offerMessages = {
    createdEvent: (
      <div>
        {buyer} made an offer on {listingTitle} on {timestamp}
        {dayjs.unix(timestamp).format('MMM Do h:mmA')}
      </div>
    ),
    acceptedEvent: (
      <div>
        {seller} accepted the offer for {listingTitle} on {timestamp}
        {dayjs.unix(timestamp).format('MMM Do h:mmA')}
      </div>
    )
  }

  // if (!party || !message) return null

  return offerMessages[offerTitle]
}
export default TransactionMessage
