import graphqlFields from 'graphql-fields'
import { getIdsForPage, getConnection } from '../_pagination'
import contracts from '../../contracts'
import get from 'lodash/get'
// import memoize from 'lodash/memoize'

export async function getTransactionReceipt(id) {
  const rawReceipt = await contracts.web3.eth.getTransactionReceipt(id)

  // Note: Check on the both receipt and receipt.blockNumber since Parity returns
  // a receipt with no blockNumber if transaction is not yet mined (Geth does not).
  if (!rawReceipt || !rawReceipt.blockNumber) {
    return null
  }

  const jsonInterfaces = [
    ...get(contracts, 'marketplace.options.jsonInterface', []),
    ...get(contracts, 'identityEvents.options.jsonInterface', []),
    ...get(contracts, 'uniswapFactory.options.jsonInterface', []),
    ...get(contracts, 'daiExchange.options.jsonInterface', [])
  ]

  const events = rawReceipt.logs.map(log => {
    const eventDef = jsonInterfaces.find(s => s.signature === log.topics[0])
    const logObj = {
      ...log,
      raw: log,
      returnValues: null,
      event: null
    }
    // This should never happen - all events should have an id.
    if (!logObj.id) {
      throw new Error(`Found event with no id in receipt ${id}`)
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

// export const getTransactionReceipt = memoize(getTransactionReceiptFn)

const getTr = async id => await contracts.web3.eth.getTransaction(id)
// const getTr = memoize(getTrRaw)

export async function getTransaction(id, fields = {}, localTransactions = []) {
  const transaction = await getTr(id)

  const localTx = localTransactions.find(tx => tx.id === id) || {}

  const receipt =
    fields.status || fields.receipt ? await getTransactionReceipt(id) : null

  return {
    id,
    status: receipt ? 'receipt' : transaction ? 'pending' : 'submitted',
    submittedAt: localTx.submittedAt,
    receipt,
    ...transaction
  }
}

export async function transactions(user, { first = 10, after }, context, info) {
  if (!user) {
    return null
  }

  const fields = graphqlFields(info)

  const userTransactions = contracts.transactions[user.id] || []
  const totalCount = userTransactions.length
  const allIds = userTransactions.map(t => t.id)

  const { ids, start } = getIdsForPage({ after, ids: allIds, first })

  let nodes = []
  if (!fields || fields.nodes) {
    nodes = await Promise.all(
      ids.map(id => getTransaction(id, fields.nodes, userTransactions))
    )
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}
