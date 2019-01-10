import graphqlFields from 'graphql-fields'
import contracts from '../../contracts'

function bota(input) {
  return new Buffer(input.toString(), 'binary').toString('base64')
}

function convertCursorToOffset(cursor) {
  return parseInt(atob(cursor))
}

function atob(input) {
  return new Buffer(input, 'base64').toString('binary')
}

export async function getTransactionReceipt(id) {
  const rawReceipt = await contracts.web3.eth.getTransactionReceipt(id)
  if (!rawReceipt) {
    return null
  }

  const jsonInterfaces = [
    ...contracts.marketplace.options.jsonInterface,
    ...contracts.claimHolderPresigned.options.jsonInterface,
    ...contracts.userRegistry.options.jsonInterface
  ]

  const events = rawReceipt.logs.map(log => {
    const eventDef = jsonInterfaces.find(s => s.signature === log.topics[0])
    const logObj = {
      ...log,
      raw: log,
      returnValues: null,
      event: null
    }
    if (eventDef) {
      const decoded = contracts.web3.eth.abi.decodeLog(
        eventDef.inputs,
        log.data,
        log.topics.slice(1)
      )
      if (decoded.listingID) {
        logObj.returnValues = decoded
      }
      logObj.returnValuesArr = Object.keys(decoded)
        .filter(f => !f.match(/^[0-9]+$/) && !f.match(/^__/))
        .map(field => ({
          field,
          value: decoded[field]
        }))
      logObj.event = eventDef.name
    }
    return logObj
  })

  return { id, ...rawReceipt, events }
}

export async function getTransaction(id, fields = {}) {
  const status = 'submitted'
  const transaction = await contracts.web3.eth.getTransaction(id)

  return {
    id,
    status,
    receipt: fields.receipt ? await getTransactionReceipt(id) : null,
    ...transaction
  }
}

export async function transactions(
  contract,
  { first = 10, after },
  context,
  info
) {
  if (!contract) {
    return null
  }

  const fields = graphqlFields(info)

  const totalCount = contracts.transactions.length
  let ids = contracts.transactions

  let start = 0,
    nodes = []
  if (after) {
    start = ids.indexOf(convertCursorToOffset(after)) + 1
  }
  const end = start + first
  ids = ids.slice(start, end)

  if (!fields || fields.nodes) {
    nodes = await Promise.all(
      contracts.transactions.map(transaction =>
        getTransaction(transaction.id, fields.nodes)
      )
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
