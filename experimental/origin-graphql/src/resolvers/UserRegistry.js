function bota(input) {
  return new Buffer(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return atob(cursor)
}

function atob(input) {
  return new Buffer(input, 'base64').toString('binary')
}

async function identities(contract, { first = 10, after }) {
  if (!contract) {
    return null
  }

  const events = await contract.getPastEvents('NewUser', { fromBlock: 0 })

  const identities = {}
  events.forEach(event => {
    const id = event.returnValues._identity
    if (!id) return
    identities[id] = identities[id] || { id }
  })

  let nodes = Object.values(identities)
  const ids = nodes.map(n => n.id)
  const totalCount = ids.length

  let start = 0
  if (after) {
    start = ids.indexOf(convertCursorToOffset(after)) + 1
  }
  const end = start + first
  nodes = nodes.slice(start, end)

  const firstNodeId = nodes.length ? nodes[0].id : 0
  const lastNodeId = nodes.length ? nodes[nodes.length - 1].id : 0

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

export default {
  id: contract => contract.options.address,
  identities
}
