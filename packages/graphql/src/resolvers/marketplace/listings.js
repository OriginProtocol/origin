import graphqlFields from 'graphql-fields'
import contracts from '../../contracts'
import { filterNonVisibleListingIds } from '../../utils/listingVisibility'
import { proxyOwner } from '../../utils/proxy'
import { getListingId } from '../../utils/getId'
import parseId from '../../utils/parseId'

function bota(input) {
  return Buffer.from(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return atob(cursor)
}

function atob(input) {
  return Buffer.from(input, 'base64').toString('binary')
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
  const ids = searchResult.nodes.map(n => n.id)
  return { totalCount: searchResult.numberOfItems, ids }
}

async function allIds(contract, version) {
  const totalListings = Number(await contract.methods.totalListings().call())
  const ids = Array.from({ length: Number(totalListings) }, (v, i) =>
    getListingId(contract.networkId, version, i)
  ).reverse()
  return { totalCount: ids.length, ids }
}

/**
 * Given a complete set of listing ids, computes pagination and fetches
 * listing metadata data for the page requested.
 *
 * @param {Array<string>} ids: List of listing
 * @param {String} after: cursor. base64 encoded listing id. Ex: 'MS0wMDAtMjky' -> '1-000-292'
 * @param {Integer} first: number of listings requested
 * @param {Integer} totalCount: total number of listings in the set
 * @param fields
 * @param {boolean} checkVisibility: whether or not a visibility check should be performed against the discovery server
 * @returns {Promise<{nodes: Array, pageInfo: {hasNextPage: boolean, hasPreviousPage: boolean, endCursor: string, startCursor: string}, edges: {cursor: string, node: *}[], totalCount: *}>}
 */
async function resultsFromIds({
  ids,
  after,
  first,
  totalCount,
  fields,
  checkVisibility
}) {
  let start = 0,
    nodes = [],
    listingIds

  if (after) {
    start = ids.indexOf(convertCursorToOffset(after)) + 1
  }

  let end
  if (contracts.discovery && checkVisibility) {
    // Check the listings are visible against the discovery server. We check a few
    // extra ids so that we can return the number of listings requested in case
    // some fail the visibility check and get filtered out.
    const numToCheck = Math.ceil(first * 1.2)
    const idsToCheck = ids.slice(start, start + numToCheck)
    const visibleIds = await filterNonVisibleListingIds(idsToCheck)
    listingIds = visibleIds.slice(0, first)
    end = ids.indexOf(listingIds[listingIds.length - 1])
  } else {
    end = start + first
    listingIds = ids.slice(start, end)
  }

  if (!fields || fields.nodes) {
    nodes = (await Promise.all(
      listingIds.map(async id => {
        // Fetch the listing data from eventSource.
        const { marketplace, listingId } = parseId(id, contracts)
        const eventSource = marketplace.eventSource
        return eventSource.getListing(listingId).catch(e => e)
      })
    )).filter(node => node && !(node instanceof Error))
  }
  const firstNodeId = listingIds[0] || 0
  const lastNodeId = listingIds[listingIds.length - 1] || 0

  return {
    totalCount,
    nodes,
    pageInfo: {
      endCursor: bota(lastNodeId),
      hasNextPage: end < totalCount,
      hasPreviousPage: start > 0,
      startCursor: bota(firstNodeId)
    },
    edges: nodes.map(node => ({ cursor: bota(node.id), node }))
  }
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

  let allIds = []
  for (const version in contracts.marketplaces) {
    const eventCache = contracts.marketplaces[version].contract.eventCache

    let events = await eventCache.getEvents({ event: 'ListingCreated', party })

    if (filter === 'active') {
      const withdrawn = await eventCache.getEvents({
        event: 'ListingWithdrawn',
        party
      })
      const ids = withdrawn.map(e => e.returnValues.listingID)
      events = events.filter(e => ids.indexOf(e.returnValues.listingID) < 0)
    } else if (filter === 'inactive') {
      events = await eventCache.getEvents({ event: 'ListingWithdrawn', party })
    }

    allIds = allIds.concat(
      events.map(e =>
        getListingId(contracts.networkId, version, e.returnValues.listingID)
      )
    )
  }

  const totalCount = allIds.length
  return await resultsFromIds({
    after,
    ids: allIds,
    first,
    totalCount,
    fields,
    checkVisibility: true
  })
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

  if (listingIds.length > 0) {
    // List of ids to consider is supplied by the caller.
    ids = listingIds
    totalCount = listingIds.length
  } else {
    if (contracts.discovery) {
      // Issue a search query against the discovery server.
      // Non-visible listings are filtered.
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
        const decentralizedResults = await allIds(curContract, version)
        ids = ids.concat(decentralizedResults.ids)
        totalCount += decentralizedResults.totalCount
      }
    }
  }

  return await resultsFromIds({
    after,
    ids,
    first,
    totalCount,
    checkVisibility: false // No need to check again. Search results are already filtered.
  })
}
