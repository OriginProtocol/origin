import React from 'react'
import dayjs from 'dayjs'
import { fbt } from 'fbt-runtime'

import OfferPrice from './_OfferPrice'
import Link from 'components/Link'
import Stages from 'components/TransactionStages'

import Pic from 'components/ListingPic'
import OfferStatus from './_OfferStatus'

import distanceToNow from 'utils/distanceToNow'

const Purchase = ({ listing, offer }) => (
  <Link className="purchase" to={`/purchases/${offer.id}`}>
    <div className="pic">
      <Pic listing={listing} />
      {offer.quantity === undefined || offer.quantity <= 1 ? null : (
        <div className="quantity">{offer.quantity}</div>
      )}
    </div>
    <div className="details">
      <div className="top">
        <h2 className="title mb-1">
          {listing.title || <i>Untitled Listing</i>}
        </h2>
        <div className="right">
          <span className="time-estimate">
            {distanceToNow(offer.createdEvent.timestamp, true) + ' ago'}
          </span>
          <OfferStatus offer={offer} />
        </div>
      </div>
      <div className="date">
        {listing.createdEvent &&
          fbt('Offer made on', 'Purchases.offerMadeOn') +
            ` ${dayjs
              .unix(offer.createdEvent.timestamp)
              .format('MMMM D, YYYY')}`}
      </div>
      <div className="price">
        <div className="d-flex">
          <OfferPrice listing={listing} offer={offer} />
        </div>
      </div>
      <Stages mini offer={offer} />
    </div>
  </Link>
)

export default Purchase
