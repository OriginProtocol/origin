import graphqlFields from 'graphql-fields'
import contracts from '../../contracts'
import isNil from 'lodash/isNil'

import { getFeatured, getHidden } from './_featuredAndHidden'

function bota(input) {
  return new Buffer(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return parseInt(atob(cursor))
}

function atob(input) {
  return new Buffer(input, 'base64').toString('binary')
}

function getVariables({ search, filters }) {
  if (isNil(search)) {
    return { filters }
  } else {
    return { search, filters }
  }
}
const discoveryQuery = `
query Search($search: String, $filters: [ListingFilter!]) {
  listings(
    searchQuery: $search
    filters: $filters
    page: { offset: 0, numberOfItems: 1000 }
  ) {
    numberOfItems
    nodes { id }
  }
}`

async function searchIds(props) {
  const variables = getVariables(props)

  const searchResult = await new Promise(resolve => {
    fetch(contracts.discovery, {
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        query: discoveryQuery,
        variables
      })
    })
      .then(response => response.json())
      .then(response => resolve(response.data.listings))
  })
  const ids = searchResult.nodes.map(n => Number(n.id.split('-')[2]))
  return { totalCount: searchResult.numberOfItems, ids }
}

async function allIds({ contract, sort, hidden }) {
  const featuredIds =
    sort === 'featured' ? await getFeatured(contracts.net) : []
  const hiddenIds = hidden ? await getHidden(contracts.net) : []

  const totalListings = Number(await contract.methods.totalListings().call())

  let ids = Array.from({ length: Number(totalListings) }, (v, i) => i)
    .filter(id => hiddenIds.indexOf(id) < 0)
    .reverse()

  if (featuredIds.length) {
    ids = [...featuredIds, ...ids.filter(i => featuredIds.indexOf(i) < 0)]
  }

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
    nodes = await Promise.all(
      ids.map(id => contracts.eventSource.getListing(id))
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

export async function listingsBySeller(
  listingSeller,
  { first = 10, after },
  _,
  info
) {
  const fields = graphqlFields(info)
  const events = await contracts.marketplace.eventCache.allEvents(
    'ListingCreated',
    listingSeller.id
  )

  const ids = events.map(e => Number(e.returnValues.listingID)).reverse()
  const totalCount = ids.length

  return await resultsFromIds({ after, ids, first, totalCount, fields })
}

export default async function listings(
  contract,
  { first = 10, after, sort, hidden = true, search, filters }
) {
  if (!contract) {
    return null
  }

  let ids = [],
    totalCount = 0

  if ((!isNil(search) || filters.length) && contracts.discovery) {
    ;({ totalCount, ids } = await searchIds({ search, filters })) // eslint-disable-line
  } else {
    ;({ totalCount, ids } = await allIds({ contract, sort, hidden })) // eslint-disable-line
  }

  return await resultsFromIds({ after, ids, first, totalCount })
}
