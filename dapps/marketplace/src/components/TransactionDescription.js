import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

const Events = [
  'ListingCreated',
  'ListingUpdated',
  'ListingWithdrawn',
  'ListingArbitrated',
  'ListingData',
  'OfferCreated',
  'OfferAccepted',
  'OfferFinalized',
  'OfferWithdrawn',
  'OfferFundsAdded',
  'OfferDisputed',
  'OfferRuling',
  'OfferData'
]

class TransactionDescription extends Component {
  render() {
    const receipt = this.props.receipt
    if (!receipt) return null

    const event =
      receipt.events.find(e => Events.indexOf(e.event) >= 0) ||
      receipt.events[0]

    if (!event) {
      return null
    }

    let description = 'Transaction: ' + event.id

    const name = event.event
    if (name === 'OfferCreated') {
      description = fbt(
        'You purchased a listing',
        'TransactionDescription.offerCreated'
      )
    } else if (name === 'OfferAccepted') {
      description = fbt(
        'You accepted an offer',
        'TransactionDescription.offerAccepted'
      )
    } else if (name === 'OfferFinalized') {
      description = fbt(
        'You finalized a transaction',
        'TransactionDescription.offerFinalized'
      )
    } else if (name === 'OfferWithdrawn') {
      description = fbt(
        'You withdrew an offer',
        'TransactionDescription.offerWithdrawn'
      )
    } else if (name === 'OfferDisputed') {
      description = fbt(
        'You disputed an offer',
        'TransactionDescription.offerDisputed'
      )
    } else if (name === 'ListingCreated') {
      description = fbt(
        'You created a listing',
        'TransactionDescription.listingCreated'
      )
    } else if (name === 'ListingUpdated') {
      description = fbt(
        'You updated a listing',
        'TransactionDescription.listingUpdated'
      )
    } else if (name === 'IdentityUpdated') {
      description = fbt(
        'You updated your profile',
        'TransactionDescription.identityUpdated'
      )
    }

    return <div>{description}</div>
  }
}

export default TransactionDescription
