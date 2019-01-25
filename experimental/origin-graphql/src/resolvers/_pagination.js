/**
 * Usage:
 *
 *     import { getIdsForPage, getConnection } from './_pagination'
 *
 *     const { ids, start, end } = getIdsForPage({ after, ids: allIds, first })
 *
 *     const nodes = await Promise.all(
 *       ids.map(id => {
 *         const [listingId, offerId] = id.split('-')
 *         return contracts.eventSource.getOffer(listingId, offerId)
 *       })
 *     )
 *
 *     return getConnection({ start, first, nodes, ids, totalCount })
 *
 */

function bota(input) {
  return new Buffer(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return atob(cursor)
}

function atob(input) {
  return new Buffer(input, 'base64').toString('binary')
}

export function getIdsForPage({ after, ids, first }) {
  let start = 0
  if (after) {
    start = ids.indexOf(convertCursorToOffset(after)) + 1
  }
  const end = start + first
  return { ids: ids.slice(start, end), start }
}

export function getConnection({ start, first, nodes, ids, totalCount }) {
  const firstNodeId = ids[0] || 0
  const lastNodeId = ids[ids.length - 1] || 0
  const end = start + first

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
