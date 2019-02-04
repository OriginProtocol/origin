import { getIdsForPage, getConnection } from '../_pagination'

import sortBy from 'lodash/sortBy'

export default async function users(contract, { first = 10, after, sort }) {
  if (!contract) {
    return null
  }

  const events = await contract.eventCache.allEvents()
  const users = {}
  events.forEach(event => {
    const id = event.returnValues.party
    if (!id) return
    users[id] = users[id] || {
      id,
      account: { id },
      listingCount: 0,
      offerCount: 0,
      firstEvent: event
    }
    users[id].lastEvent = event
    if (event.event === 'ListingCreated') {
      users[id].listingCount += 1
    } else if (event.event === 'OfferCreated') {
      users[id].offerCount += 1
    }
  })

  let nodes = Object.values(users)
  if (sort === 'listings') {
    nodes = sortBy(nodes, n => -n.listingCount)
  } else if (sort === 'offers') {
    nodes = sortBy(nodes, n => -n.offerCount)
  } else if (sort === 'firstAction') {
    nodes = sortBy(nodes, n => -n.firstEvent.blockNumber)
  } else if (sort === 'lastAction') {
    nodes = sortBy(nodes, n => -n.lastEvent.blockNumber)
  }

  const allIds = nodes.map(n => n.id)
  const totalCount = allIds.length

  const { ids, start } = getIdsForPage({ after, ids: allIds, first })

  return getConnection({
    start,
    first,
    nodes: nodes.filter(n => ids.indexOf(n.id) >= 0),
    ids,
    totalCount
  })
}
