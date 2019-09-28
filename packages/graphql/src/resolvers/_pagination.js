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
  return Buffer.from(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return atob(cursor)
}

function atob(input) {
  return Buffer.from(input, 'base64').toString('binary')
}

export function getIdsForPage({ after, ids, first }) {
  let start = 0
  if (after) {
    start = ids.indexOf(convertCursorToOffset(after)) + 1
  }
  return { ids: ids.slice(start, first ? start + first : undefined), start }
}

export function getConnection({ start, first, nodes, ids, totalCount }) {
  const firstNodeId = ids[0] || 0
  const end = start + first
  const lastNodeId = ids[end - 1] || ids[ids.length - 1] || 0

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
