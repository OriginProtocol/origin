import contracts from '../contracts'

function bota(input) {
  return new Buffer(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return parseInt(atob(cursor))
}

function atob(input) {
  return new Buffer(input, 'base64').toString('binary')
}

export default {
  address: contract => {
    if (!contract) {
      return null
    }
    return contract._address
  },
  totalListings: contract => {
    if (!contract) {
      return null
    }
    return contract.methods.totalListings().call()
  },
  listing: (contract, args) => contracts.eventSource.getListing(args.id),

  listings: async (contract, { first = 10, after }) => {
    if (!contract) {
      return null
    }
    const totalCount = Number(await contract.methods.totalListings().call())
    after = after ? convertCursorToOffset(after) : totalCount
    const ids = Array.from({ length: Number(totalCount) }, (v, i) => i)
      .reverse()
      .filter(id => id < after)
      .slice(0, first)
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
  },

  account: contract => {
    if (!contract) {
      return null
    }
    return { id: contract._address }
  },
  token: async contract => {
    if (!contract) {
      return null
    }
    return { id: await contract.methods.tokenAddr().call() }
  },
  owner: async contract => {
    if (!contract) {
      return null
    }
    return { id: await contract.methods.owner().call() }
  },
  events: async (_, { limit = 10, offset = 0 }) => {
    const events = await contracts.marketplace.eventCache.allEvents()
    return [...events].reverse().slice(offset, offset + limit)
  },
  totalEvents: async () => {
    const events = await contracts.marketplace.eventCache.allEvents()
    return events.length
  }
}
