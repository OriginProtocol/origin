import graphqlFields from 'graphql-fields'

import contracts from '../contracts'
import { listingsBySeller } from './marketplace/listings'

function bota(input) {
  return new Buffer(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return parseInt(atob(cursor))
}

function atob(input) {
  return new Buffer(input, 'base64').toString('binary')
}

async function resultsFromIds({ after, ids, first, totalCount, fields }) {
  let start = 0,
    nodes = []
  if (after) {
    start = ids.indexOf(convertCursorToOffset(after)) + 1
  }
  const end = start + first
  ids = ids.slice(start, end)

  if (fields.nodes) {
    nodes = await Promise.all(
      ids.map(id => {
        const [listingId, offerId] = id.split('-')
        return contracts.eventSource.getOffer(listingId, offerId)
      })
    )
  }

  const firstNodeId = ids[0] || 0
  const lastNodeId = ids[ids.length - 1] || 0

  return {
    totalCount,
    nodes,
    pageInfo: {
      endCursor: bota(lastNodeId),
      hasNextPage: end < totalCount,
      hasPreviousPage: firstNodeId > totalCount,
      startCursor: bota(firstNodeId)
    },
    edges: nodes.map(node => ({ cursor: bota(node.id), node }))
  }
}

async function offers(buyer, { first = 10, after }, _, info) {
  const fields = graphqlFields(info)
  const events = await contracts.marketplace.eventCache.allEvents(
    'OfferCreated',
    buyer.id
  )

  const ids = events.map(
    e => `${e.returnValues.listingID}-${e.returnValues.offerID}`
  )
  const totalCount = ids.length

  return await resultsFromIds({ after, ids, first, totalCount, fields })
}

async function sales(seller, { first = 10, after }, _, info) {
  const fields = graphqlFields(info)
  const listings = await contracts.marketplace.eventCache.allEvents(
    'ListingCreated',
    seller.id
  )

  const listingIds = listings.map(e => Number(e.returnValues.listingID))

  const events = await contracts.marketplace.eventCache.offers(
    listingIds,
    null,
    'OfferCreated'
  )

  const ids = events.map(
    e => `${e.returnValues.listingID}-${e.returnValues.offerID}`
  )
  const totalCount = ids.length

  return await resultsFromIds({ after, ids, first, totalCount, fields })
}

async function reviews(user) {
  const listings = await contracts.marketplace.eventCache.allEvents(
    'ListingCreated',
    user.id
  )

  const listingIds = listings.map(e => Number(e.returnValues.listingID))

  const events = await contracts.marketplace.eventCache.offers(
    listingIds,
    null,
    'OfferFinalized'
  )

  let nodes = await Promise.all(
    events.map(event => {
      return contracts.eventSource.getReview(
        event.returnValues.listingID,
        event.returnValues.offerID,
        event.returnValues.party,
        event.returnValues.ipfsHash
      )
    })
  )

  nodes = nodes.filter(n => n.rating)

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

export default {
  offers,
  sales,
  reviews,
  listings: listingsBySeller,
  firstEvent: async user => {
    if (user.firstEvent) return user.firstEvent
    const events = await contracts.marketplace.eventCache.allEvents(
      undefined,
      user.id
    )
    return events[0]
  },
  lastEvent: async user => {
    if (user.lastEvent) return user.lastEvent
    const events = await contracts.marketplace.eventCache.allEvents(
      undefined,
      user.id
    )
    return events[events.length - 1]
  }
}
