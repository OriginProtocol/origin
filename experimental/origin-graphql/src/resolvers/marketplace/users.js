function bota(input) {
  return new Buffer(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return atob(cursor)
}

function atob(input) {
  return new Buffer(input, 'base64').toString('binary')
}

export default async function users(contract, { first = 10, after }) {
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
      firstEvent: event
    }
    users[id].lastEvent = event
  })

  const ids = Object.keys(users)
  let nodes = Object.values(users)
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
