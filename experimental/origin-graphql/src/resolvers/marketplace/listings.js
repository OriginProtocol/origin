// https://cdn.jsdelivr.net/gh/originprotocol/origin@hidefeature_list/featurelist_1.txt
import contracts from '../../contracts'
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

const discoveryQuery = `
query Search($search: String) {
  listings(
    searchQuery: $search
    filters: []
    page: { offset: 0, numberOfItems: 1000 }
  ) {
    numberOfItems
    nodes { id }
  }
}`

export default async function listings(
  contract,
  { first = 10, after, sort, hidden = true, search }
) {
  if (!contract) {
    return null
  }

  let ids = [],
    totalCount = 0

  if (search) {
    const searchResult = await new Promise(resolve => {
      fetch('https://discovery.originprotocol.com', {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          query: discoveryQuery,
          variables: { search }
        })
      })
        .then(response => response.json())
        .then(response => resolve(response.data.listings))
    })
    totalCount = searchResult.numberOfItems
    ids = searchResult.nodes.map(n => Number(n.id.split('-')[2]))
  } else {
    const featuredIds =
      sort === 'featured' ? await getFeatured(contracts.net) : []
    const hiddenIds = hidden ? await getHidden(contracts.net) : []

    totalCount = Number(await contract.methods.totalListings().call())

    ids = Array.from({ length: Number(totalCount) }, (v, i) => i)
      .filter(id => hiddenIds.indexOf(id) < 0)
      .reverse()

    if (featuredIds.length) {
      ids = [...featuredIds, ...ids.filter(i => featuredIds.indexOf(i) < 0)]
    }
  }

  after = after ? convertCursorToOffset(after) : ids[0]

  let idx = ids.indexOf(after)
  if (idx > 0) idx += 1
  ids = ids.slice(idx, idx + first)

  const nodes = await Promise.all(
    ids.map(id => contracts.eventSource.getListing(id))
  )
  const firstNodeId = ids[0] || 0
  const lastNodeId = ids[ids.length - 1] || 0

  return {
    totalCount,
    nodes,
    pageInfo: {
      endCursor: bota(lastNodeId),
      hasNextPage: lastNodeId > 0,
      hasPreviousPage: firstNodeId > totalCount,
      startCursor: bota(firstNodeId)
    },
    edges: nodes.map(node => ({ cursor: bota(node.id), node }))
  }
}
