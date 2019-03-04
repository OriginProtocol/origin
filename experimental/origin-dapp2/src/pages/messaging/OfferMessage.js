import React from 'react'
import dayjs from 'dayjs'

import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(advancedFormat)

const OfferMessage = (props) => {
  const { userName, message: { createdEvent, status, listing, timestamp }} = props
  console.log("WHAT IS THE PROPS IN OFFER MESSAGE", props)
  const offerMessages = {
    1: (
      <div>
        {userName} made an offer on {listing.title} on {dayjs.unix(timestamp).format('MMM Do h:mmA')}
      </div>

    )
  }
  return offerMessages[status]
}
