import sortBy from 'lodash/sortBy'
function bota(input) {
  return new Buffer(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return atob(cursor)
}

function atob(input) {
  return new Buffer(input, 'base64').toString('binary')
}

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
  const ids = nodes.map(n => n.id)
  const totalCount = ids.length

  let start = 0
  if (after) {
    start = ids.indexOf(convertCursorToOffset(after)) + 1
  }
  const end = start + first
  nodes = nodes.slice(start, end)

  const firstNodeId = nodes[0].id
  const lastNodeId = nodes[nodes.length - 1].id

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
