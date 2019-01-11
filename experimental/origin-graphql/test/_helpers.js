import get from 'lodash/get'

import contracts from '../src/contracts'
import queries from './_queries'
import client from '../src/index'

// Convenience function to run a mutation and return the transaction receipt
export async function mutate(mutation, variables, getEvents) {
  const result = await client.mutate({ mutation, variables })
  const key = Object.keys(result.data)[0]
  const id = result.data[key].id
  const receipt = await client.query({
    query: queries.GetReceipt,
    variables: {
      id
    }
  })
  if (!getEvents) {
    return await contracts.web3.eth.getTransactionReceipt(id)
  }
  const events = get(receipt, 'data.web3.transactionReceipt.events')
  if (!events) {
    return
  }
  const res = events.reduce((m, o) => {
    m[o.event] = o.returnValuesArr.reduce((am, ao) => {
      am[ao.field] = ao.value
      return am
    }, {})
    return m
  }, {})
  return res
}
