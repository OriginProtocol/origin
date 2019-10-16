import graphqlFields from 'graphql-fields'
import sortBy from 'lodash/sortBy'
import uniq from 'lodash/uniq'

import contracts from '../contracts'
import { listingsBySeller } from './marketplace/listings'
import { identity } from './IdentityEvents'
import { getIdsForPage, getConnection } from './_pagination'
import { proxyOwner } from '../utils/proxy'
import { transactions } from './web3/transactions'

import createDebug from 'debug'
const debug = createDebug('origin:user:')

const ec = () => contracts.marketplace.eventCache

async function resultsFromIds({ after, allIds, first, fields }) {
  let nodes = []
  const totalCount = allIds.length
  const { ids, start } = getIdsForPage({ after, ids: allIds, first })

  if (fields.nodes) {
    nodes = await Promise.all(
      ids.map(id => {
        const [version, listingId, offerId] = id.split('-')
        return contracts.marketplaces[version].eventSource.getOffer(
          listingId,
          offerId
        )
      })
    )
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}

async function offers(buyer, { first = 10, after, filter }, _, info) {
  const fields = graphqlFields(info)

  let party = buyer.id
  const owner = await proxyOwner(party)
  if (owner) {
    party = [party, owner]
  }

  let allIds = []
  for (const version in contracts.marketplaces) {
    const eventCache = contracts.marketplaces[version].contract.eventCache
    const offerEvents = await eventCache.getEvents({
      event: 'OfferCreated',
      party
    })
    const offerIDs = offerEvents.map(e => e.returnValues.offerID)
    const completedOfferEvents = await eventCache.getEvents({
      event: ['OfferFinalized', 'OfferWithdrawn', 'OfferRuling'],
      offerID: offerIDs.map(id => String(id))
    })
    const completedIds = completedOfferEvents.map(ev => {
      return `${ev.returnValues.listingID}-${ev.returnValues.offerID}`
    })

    let filteredEvents = offerEvents
    if (filter === 'complete') {
      filteredEvents = offerEvents.filter(ev => {
        const id = `${ev.returnValues.listingID}-${ev.returnValues.offerID}`
        return completedIds.indexOf(id) > -1
      })
    } else if (filter === 'pending') {
      filteredEvents = offerEvents.filter(ev => {
        const id = `${ev.returnValues.listingID}-${ev.returnValues.offerID}`
        return completedIds.indexOf(id) < 0
      })
    }

    allIds = allIds.concat(
      filteredEvents
        .map(ev => {
          const { listingID, offerID } = ev.returnValues
          return `${version}-${listingID}-${offerID}`
        })
        .reverse()
    )
  }

  return await resultsFromIds({ after, allIds, first, fields })
}

async function sales(seller, { first = 10, after, filter }, _, info) {
  const fields = graphqlFields(info)
  let party = seller.id
  const owner = await proxyOwner(party)
  if (owner) {
    party = [party, owner]
  }

  let allIds = []
  for (const version in contracts.marketplaces) {
    const eventCache = contracts.marketplaces[version].contract.eventCache

    const listings = await eventCache.getEvents({
      event: 'ListingCreated',
      party
    })
    const listingIds = listings.map(e => e.returnValues.listingID)
    const events = await eventCache.getEvents({
      listingID: listingIds,
      event: 'OfferCreated'
    })

    let ids = events
      .map(e => `${e.returnValues.listingID}-${e.returnValues.offerID}`)
      .reverse()

    if (filter) {
      const completedEvents = await eventCache.getEvents({
        event: ['OfferFinalized', 'OfferWithdrawn', 'OfferRuling'],
        offerID: events.map(e => e.returnValues.offerID)
      })
      const completedIds = uniq(
        completedEvents.map(
          e => `${e.returnValues.listingID}-${e.returnValues.offerID}`
        )
      )

      if (filter === 'complete') {
        ids = ids.filter(id => completedIds.indexOf(id) >= 0)
      } else if (filter === 'pending') {
        ids = ids.filter(id => completedIds.indexOf(id) < 0)
      }
    }
    allIds = allIds.concat(ids.map(id => `${version}-${id}`))
  }

  return await resultsFromIds({ after, allIds, first, fields })
}

async function reviews(user, { first = 10, after }) {
  let party = user.id
  const owner = await proxyOwner(party)
  if (owner) {
    party = [party, owner]
  }

  debug('Starting', owner, party)

  let totalCount = 0
  const idEvents = {}
  for (const version in contracts.marketplaces) {
    debug('version', version)
    const ec = contracts.marketplaces[version].contract.eventCache

    // Find all the OfferFinalized events associated with this user
    const listings = await ec.getEvents({ event: ['ListingCreated', 'OfferFinalized'], party })
    const listingIds = listings.map(e => String(e.returnValues.listingID))
    let events = await ec.getEvents({
      listingID: listingIds,
      event: ['OfferFinalized', 'OfferData']
    })

    events = sortBy(events, event => -event.blockNumber)

    totalCount += events.length

    debug('events', events)

    for (const event of events) {
      const { listingID, offerID } = event.returnValues
      const id = `x-${version}-${listingID}-${offerID}`
      /* Group all OfferFinalized and OfferData events together. This doesn't
       * break pagination because we extract at most 1 review per group of
       * events.
       */
      idEvents[id] = idEvents[id] ? [...idEvents[id], event] : [event]
    }
    debug('idEvents', idEvents)
  }

  const allIds = Object.keys(idEvents)
  const { ids, start } = getIdsForPage({ after, ids: allIds })

  // Fetch reviews one at a time until we have enough nodes
  const nodes = []
  for (const id of ids) {
    const events = idEvents[id]

    debug('Fetching reviews of ID')

    // fetch all events that may contain a review
    const reviews = (await Promise.all(
      events.map(event => {
        const es = contracts.marketplaces[id.split('-')[1]].eventSource
        return es.getReview(
          event.returnValues.listingID,
          event.returnValues.offerID,
          event.returnValues.party,
          event.returnValues.ipfsHash,
          event
        )
      })
    ))
      .map(review => {
        debug('review', review)
        return review
      })
      // Offer objects contain reviews of both parties, filter the other ones out.
      .filter(
        review => review.rating > 0 && !party.includes(review.reviewer.id)
      )

    if (reviews.length === 0) continue

    const review = reviews[0]

    debug('chosen one', review)
    if (review.rating && review.reviewer.id) {
      nodes.push(review)
    }
    if (nodes.length >= first) {
      break
    }
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}

// Sourced from offer events where user is alternate party
async function notifications(user, { first = 10, after, filter }, _, info) {
  const fields = graphqlFields(info)
  const party = [user.id]
  const owner = await proxyOwner(user.id)
  if (owner) party.push(owner)

  const allIds = [],
    allEvents = {}
  for (const version in contracts.marketplaces) {
    const marketplace = contracts.marketplaces[version]
    const ec = marketplace.contract.eventCache
    const sellerListings = await ec.getEvents({
      event: 'ListingCreated',
      party
    })
    const sellerListingIds = sellerListings.map(e => e.returnValues.listingID)

    const unfilteredSellerEvents = await ec.getEvents({
      event: [
        'OfferCreated',
        'OfferFinalized',
        'OfferWithdrawn',
        'OfferFundsAdded',
        'OfferDisputed',
        'OfferRuling'
      ],
      listingID: sellerListingIds
    })
    const sellerEvents = unfilteredSellerEvents.filter(
      e => party.indexOf(e.returnValues.party) < 0
    )

    const buyerListings = await ec.getEvents({ event: 'OfferCreated', party })
    const buyerListingIds = buyerListings.map(e => e.returnValues.listingID)

    const unfilteredBuyerEvents = await ec.getEvents({
      listingID: buyerListingIds,
      event: ['OfferAccepted', 'OfferRuling']
    })
    const buyerEvents = unfilteredBuyerEvents.filter(
      e => party.indexOf(e.returnValues.party) < 0
    )

    let events = sortBy([...sellerEvents, ...buyerEvents], e => -e.blockNumber)

    if (filter === 'pending') {
      const allListingIds = events.map(e => Number(e.returnValues.listingID))
      const allListings = await Promise.all(allListingIds.map(id => offers(id)))

      events = events.filter(e => {
        const idx = allListingIds.indexOf(Number(e.returnValues.listingID))
        const events = allListings[idx]
        if (e.event === 'OfferFinalized') {
          return false
        } else if (
          e.event === 'OfferCreated' &&
          events.some(t => t.event.match(/Offer(Withdrawn|Finalized)/))
        ) {
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

    events.forEach(e => {
      const id = `${version}-${e.returnValues.listingID}-${e.returnValues.offerID}-${e.blockNumber}`
      allIds.push(id)
      allEvents[id] = e
    })
  }

  const totalCount = allIds.length

  const { ids, start } = getIdsForPage({ after, ids: allIds, first })

  let offers = [],
    nodes = []

  if (fields.nodes) {
    offers = await Promise.all(
      ids.map(id => {
        const split = id.split('-')
        return contracts.marketplaces[split[0]].eventSource.getOffer(
          split[1],
          split[2],
          split[3]
        )
      })
    )

    nodes = ids.map((id, idx) => {
      const event = allEvents[id]
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

// Sourced from offer events where user is alternate party
async function counterparty(user, { first = 100, after, id }, _, info) {
  const fields = graphqlFields(info)
  const u1 = [user.id],
    u2 = [id]

  const u1Owner = await proxyOwner(user.id)
  if (u1Owner) u1.push(u1Owner)
  const u2Owner = await proxyOwner(id)
  if (u2Owner) u2.push(u2Owner)

  const u1Listings = await ec().getEvents({
    event: 'ListingCreated',
    party: u1
  })
  const u1ListingIds = u1Listings.map(e => e.returnValues.listingID)
  const u2Listings = await ec().getEvents({
    event: 'ListingCreated',
    party: u2
  })
  const u2ListingIds = u2Listings.map(e => e.returnValues.listingID)

  const u1BuyerEvents = await ec().getEvents({
    event: 'OfferCreated',
    listingID: u2ListingIds,
    party: u1
  })

  const u2BuyerEvents = await ec().getEvents({
    event: 'OfferCreated',
    listingID: u1ListingIds,
    party: u2
  })
  const allListingIds = [...u1ListingIds, ...u2ListingIds]
  const allOfferIds = [...u1BuyerEvents, ...u2BuyerEvents].reduce((m, o) => {
    m[o.returnValues.listingID] = m[o.returnValues.listingID] || []
    if (m[o.returnValues.listingID].indexOf(o.returnValues.offerID) < 0) {
      m[o.returnValues.listingID].push(o.returnValues.offerID)
    }
    return m
  }, {})

  const unfilteredEvents = await ec().getEvents({
    listingID: allListingIds,
    party: [...u1, ...u2]
  })
  const unsortedEvents = unfilteredEvents.filter(e => {
    const listingOffers = allOfferIds[e.returnValues.listingID]
    if (listingOffers) {
      return listingOffers.indexOf(e.returnValues.offerID) >= 0
    }
  })
  const allEvents = sortBy(unsortedEvents, e => -e.blockNumber)

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
  },
  identity: account => identity({ id: account.id })
}
