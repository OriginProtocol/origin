import React, { Component } from 'react'
// import { Query } from 'react-apollo'
// import get from 'lodash/get'

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

    let description = 'Transaction: ' + event.id

    const name = event.event
    if (name === 'OfferCreated') {
      description = 'You purchased a listing'
    } else if (name === 'OfferAccepted') {
      description = 'You accepted an offer'
    } else if (name === 'OfferFinalized') {
      description = 'You finalized a transaction'
    } else if (name === 'OfferWithdrawn') {
      description = 'You withdrew an offer'
    } else if (name === 'OfferDisputed') {
      description = 'You disputed an offer'
    } else if (name === 'ListingCreated') {
      description = 'You created a listing'
    } else if (name === 'ListingUpdated') {
      description = 'You updated a listing'
    } else if (name === 'IdentityUpdated') {
      description = 'You updated your profile'
    }

    return <div>{description}</div>
  }
}

export default TransactionDescription
