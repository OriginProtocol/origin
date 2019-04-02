import graphqlFields from 'graphql-fields'
import sortBy from 'lodash/sortBy'
import uniq from 'lodash/uniq'

import contracts from '../contracts'
import { listingsBySeller } from './marketplace/listings'
import { getIdsForPage, getConnection } from './_pagination'
import { transactions } from './web3/transactions'

const ec = () => contracts.marketplace.eventCache

async function resultsFromIds({ after, allIds, first, fields }) {
  let nodes = []
  const totalCount = allIds.length
  const { ids, start } = getIdsForPage({ after, ids: allIds, first })

  if (fields.nodes) {
    nodes = await Promise.all(
      ids.map(id => {
        const [listingId, offerId] = id.split('-')
        return contracts.eventSource.getOffer(listingId, offerId)
      })
    )
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}

async function offers(buyer, { first = 10, after, filter }, _, info) {
  const fields = graphqlFields(info)
  const events = await ec().allEvents('OfferCreated', buyer.id)

  let allIds = events
    .map(e => `${e.returnValues.listingID}-${e.returnValues.offerID}`)
    .reverse()

  if (filter) {
    const completedEvents = await ec().allEvents(
      ['OfferFinalized', 'OfferWithdrawn', 'OfferRuling'],
      undefined,
      allIds
    )
    const completedIds = uniq(
      completedEvents.map(
        e => `${e.returnValues.listingID}-${e.returnValues.offerID}`
      )
    )

    if (filter === 'complete') {
      allIds = allIds.filter(id => completedIds.indexOf(id) >= 0)
    } else if (filter === 'pending') {
      allIds = allIds.filter(id => completedIds.indexOf(id) < 0)
    }
  }

  return await resultsFromIds({ after, allIds, first, fields })
}

async function sales(seller, { first = 10, after, filter }, _, info) {
  const fields = graphqlFields(info)

  const listings = await ec().allEvents('ListingCreated', seller.id)
  const listingIds = listings.map(e => Number(e.returnValues.listingID))
  const events = await ec().offers(listingIds, null, 'OfferCreated')

  let allIds = events
    .map(e => `${e.returnValues.listingID}-${e.returnValues.offerID}`)
    .reverse()

  if (filter) {
    const completedEvents = await ec().allEvents(
      ['OfferFinalized', 'OfferWithdrawn', 'OfferRuling'],
      undefined,
      allIds
    )
    const completedIds = uniq(
      completedEvents.map(
        e => `${e.returnValues.listingID}-${e.returnValues.offerID}`
      )
    )

    if (filter === 'complete') {
      allIds = allIds.filter(id => completedIds.indexOf(id) >= 0)
    } else if (filter === 'pending') {
      allIds = allIds.filter(id => completedIds.indexOf(id) < 0)
    }
  }

  return await resultsFromIds({ after, allIds, first, fields })
}

async function reviews(user) {
  const listings = await ec().allEvents('ListingCreated', user.id)
  const listingIds = listings.map(e => Number(e.returnValues.listingID))
  const events = await ec().offers(listingIds, null, 'OfferFinalized')

  let nodes = await Promise.all(
    events.map(event =>
      contracts.eventSource.getReview(
        event.returnValues.listingID,
        event.returnValues.offerID,
        event.returnValues.party,
        event.returnValues.ipfsHash,
        event
      )
    )
  )

  nodes = sortBy(nodes.filter(n => n.rating), n => -n.event.blockNumber)

  return {
    totalCount: nodes.length,
    nodes,
    pageInfo: {
      endCursor: '',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: ''
    }
  }
}

// Sourced from offer events where user is alternate party
async function notifications(user, { first = 10, after, filter }, _, info) {
  const fields = graphqlFields(info)

  const sellerListings = await ec().allEvents('ListingCreated', user.id)

  const sellerListingIds = sellerListings.map(e =>
    Number(e.returnValues.listingID)
  )

  const sellerEvents = await ec().offers(
    sellerListingIds,
    null,
    [
      'OfferCreated',
      'OfferFinalized',
      'OfferWithdrawn',
      'OfferFundsAdded',
      'OfferDisputed',
      'OfferRuling'
    ],
    user.id
  )

  const buyerListings = await ec().allEvents('OfferCreated', user.id)

  const buyerListingIds = buyerListings.map(e =>
    Number(e.returnValues.listingID)
  )

  const buyerEvents = await ec().offers(
    buyerListingIds,
    null,
    ['OfferAccepted', 'OfferRuling'],
    user.id
  )

  let allEvents = sortBy([...sellerEvents, ...buyerEvents], e => -e.blockNumber)

  if (filter === 'pending') {
    const allListingIds = allEvents.map(e => Number(e.returnValues.listingID))
    const allListings = await Promise.all(
      allListingIds.map(id => ec().offers(id))
    )

    allEvents = allEvents.filter(e => {
      const idx = allListingIds.indexOf(Number(e.returnValues.listingID))
      const events = allListings[idx]
      if (e.event === 'OfferFinalized') {
        return false
      } else if (
        e.event === 'OfferCreated' &&
        events.some(t => t.event.match(/Offer(Withdrawn|Finalized)/))
      ) {
        console.log(events)
        return false
      } else if (
        e.event === 'OfferAccepted' &&
        events.some(t => t.event === 'OfferFinalized')
      ) {
        return false
      } else {
        return true
      }
    })
  }

  const totalCount = allEvents.length,
    allIds = allEvents.map(e => e.id)

  const { ids, start } = getIdsForPage({ after, ids: allIds, first })
  const filteredEvents = allEvents.filter(e => ids.indexOf(e.id) >= 0)

  let offers = [],
    nodes = []

  if (fields.nodes) {
    offers = await Promise.all(
      filteredEvents.map(event =>
        contracts.eventSource.getOffer(
          event.returnValues.listingID,
          event.returnValues.offerID,
          event.blockNumber
        )
      )
    )
    nodes = filteredEvents.map((event, idx) => {
      const party = event.returnValues.party
      return {
        id: event.id,
        offer: offers[idx],
        party: { id: party, account: { id: party } },
        event,
        read: false
      }
    })
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}

const SellerEvents = ['OfferAccepted', 'OfferWithdrawn', 'OfferDisputed']
const BuyerEvents = [
  'OfferCreated',
  'OfferFinalized',
  'OfferWithdrawn',
  'OfferDisputed'
]

// Sourced from offer events where user is alternate party
async function counterparty(user, { first = 100, after, id }, _, info) {
  const fields = graphqlFields(info)
  const u1 = user.id,
    u2 = id

  const u1Listings = await ec().allEvents('ListingCreated', u1)
  const u1ListingIds = u1Listings.map(e => Number(e.returnValues.listingID))
  const u2Listings = await ec().allEvents('ListingCreated', u2)
  const u2ListingIds = u2Listings.map(e => Number(e.returnValues.listingID))

  const u1BuyerEvents = await ec().offers(
    u2ListingIds,
    null,
    BuyerEvents,
    null,
    u1
  )
  const u1BuyerIds = u1BuyerEvents.map(e => Number(e.returnValues.listingID))
  const u2BuyerEvents = await ec().offers(
    u1ListingIds,
    null,
    BuyerEvents,
    null,
    u2
  )
  const u2BuyerIds = u2BuyerEvents.map(e => Number(e.returnValues.listingID))

  const u1SellEvents = await ec().offers(u1BuyerIds, null, SellerEvents, null, u2)
  const u2SellEvents = await ec().offers(u2BuyerIds, null, SellerEvents, null, u1)

  const allEvents = sortBy(
    [...u1BuyerEvents, ...u2BuyerEvents, ...u1SellEvents, ...u2SellEvents],
    e => -e.blockNumber
  )

  const totalCount = allEvents.length,
    allIds = allEvents.map(e => e.id)

  const { ids, start } = getIdsForPage({ after, ids: allIds, first })
  const filteredEvents = allEvents.filter(e => ids.indexOf(e.id) >= 0)

  let offers = [],
    nodes = []

  if (fields.nodes) {
    offers = await Promise.all(
      filteredEvents.map(event =>
        contracts.eventSource.getOffer(
          event.returnValues.listingID,
          event.returnValues.offerID,
          event.blockNumber
        )
      )
    )
    nodes = filteredEvents.map((event, idx) => {
      const party = event.returnValues.party
      return {
        id: event.id,
        offer: offers[idx],
        party: { id: party, account: { id: party } },
        event,
        read: false
      }
    })
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}

export default {
  offers,
  sales,
  reviews,
  notifications,
  transactions,
  counterparty,
  listings: listingsBySeller,
  firstEvent: async user => {
    if (user.firstEvent) return user.firstEvent
    const events = await ec().allEvents(undefined, user.id)
    return events[0]
  },
  lastEvent: async user => {
    if (user.lastEvent) return user.lastEvent
    const events = await ec().allEvents(undefined, user.id)
    return events[events.length - 1]
  }
}
