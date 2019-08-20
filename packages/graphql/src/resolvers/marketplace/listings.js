import graphqlFields from 'graphql-fields'
import contracts from '../../contracts'
import { proxyOwner } from '../../utils/proxy'

function bota(input) {
  return new Buffer(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return parseInt(atob(cursor))
}

function atob(input) {
  return new Buffer(input, 'base64').toString('binary')
}

const discoveryQuery = `
query Search($search: String, $filters: [ListingFilter!], $sort: String, $order: String) {
  listings(
    searchQuery: $search
    filters: $filters,
    sort: $sort,
    order: $order,
    page: { offset: 0, numberOfItems: 1000 }
  ) {
    numberOfItems
    nodes { id }
  }
}`

async function searchIds(search, sort, order, filters) {
  const variables = {}
  if (search) {
    variables.search = search
  }
  if (filters) {
    variables.filters = filters
  }
  if (sort) {
    variables.sort = sort
  }
  if (order) {
    variables.order = order
  }
  const searchResult = await new Promise(resolve => {
    fetch(contracts.discovery, {
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ query: discoveryQuery, variables })
    })
      .then(response => response.json())
      .then(response => {
        resolve(response.data.listings)
      })
  })
  const ids = searchResult.nodes
    .map(n => Number(n.id.split('-')[2]))
    .filter(id => id >= 0)
  return { totalCount: searchResult.numberOfItems, ids }
}

async function allIds(contract, version, netId) {
  const totalListings = Number(await contract.methods.totalListings().call())
  const ids = Array.from(
    { length: Number(totalListings) },
    (v, i) => `${netId}-${version}-${i}`
  ).reverse()
  return { totalCount: ids.length, ids }
}

async function resultsFromIds({ after, ids, first, totalCount, fields }) {
  let start = 0,
    nodes = []
  if (after) {
    start = ids.indexOf(convertCursorToOffset(after)) + 1
  }
  const end = start + first
  ids = ids.slice(start, end)

  if (!fields || fields.nodes) {
    nodes = (await Promise.all(
      ids.map(id => {
        const splitId = id.split('-')
        const eventSource = contracts.marketplaces[splitId[1]].eventSource
        return eventSource.getListing(id.split('-')[2]).catch(e => e)
      })
    )).filter(node => !(node instanceof Error))
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

async function getEvents(args) {
  const results = {}
  for (const version in contracts.marketplaces) {
    const eventCache = contracts.marketplaces[version].contract.eventCache
    results[version] = await eventCache.getEvents(args)
  }
  return results
}

export async function listingsBySeller(
  listingSeller,
  { first = 10, after, filter },
  _,
  info
) {
  const fields = graphqlFields(info)
  let party = listingSeller.id
  const owner = await proxyOwner(party)
  if (owner) {
    party = [party, owner]
  }

  let events = await getEvents({ event: 'ListingCreated', party })

  if (filter === 'active') {
    const withdrawn = await getEvents({ event: 'ListingWithdrawn', party })
    Object.keys(withdrawn).forEach(v => {
      const ids = withdrawn[v].map(e => e.returnValues.listingID)
      events[v] = events[v].filter(
        e => ids.indexOf(e.returnValues.listingID) < 0
      )
    })
  } else if (filter === 'inactive') {
    events = await getEvents({ event: 'ListingWithdrawn', party })
  }

  const ids = Object.keys(events)
    .map(v => events[v].map(e => `999-${v}-${e.returnValues.listingID}`))
    .flat()

  const totalCount = ids.length

  return await resultsFromIds({ after, ids, first, totalCount, fields })
}

export default async function listings(
  contract,
  { first = 10, after, sort, order, search, filters = [], listingIds = [] }
) {
  if (!contract) {
    return null
  }

  let ids = [],
    totalCount = 0,
    discoveryError = false

  if (contracts.discovery) {
    try {
      const discoveryResult = await searchIds(search, sort, order, filters)
      ids = discoveryResult.ids
      totalCount = ids.length
    } catch (err) {
      console.log('Failed to retrieve results from discovery server', err)
      discoveryError = true
    }
  }
  if (!contracts.discovery || discoveryError) {
    // Important: `search`, `sort`, `order` and `filters` params are applied only when
    // discovery server is up. They are ignored when running in decentralized mode
    // due to performance and implementation issues

    for (const version in contracts.marketplaces) {
      const curContract = contracts.marketplaces[version].contract
      const decentralizedResults = await allIds(curContract, version, '999')
      ids = ids.concat(decentralizedResults.ids)
      totalCount += decentralizedResults.totalCount
    }
  }
  // Need to determine if this is ever used, it seems to be the only use case
  // for passing ids from centralised graphql. I changed that to pass the full listing
  if (listingIds.length > 0) {
    ids = listingIds
    totalCount = listingIds.length
  }

  return await resultsFromIds({ after, ids, first, totalCount })
}
