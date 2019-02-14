import assert from 'assert'
import get from 'lodash/get'

import contracts from '../src/contracts'
import queries from './_queries'
import client from '../src/index'

// Convenience function to run a mutation and return either the raw transaction
// receipt, or an object containing the returned events and their params & values
export async function mutate(mutation, variables, getEvents) {
  // First, run the mutation and get the result
  const result = await client.mutate({ mutation, variables })

  const blockNumber = await contracts.web3.eth.getBlockNumber()
  contracts.marketplace.eventCache.updateBlock(blockNumber)

  // Assume mutation returns an object with a transaction hash in the format
  // data.mutationName.id
  const key = Object.keys(result.data)[0]
  const id = result.data[key].id

  // If we didn't want an events object, just return the raw receipt
  if (!getEvents) {
    return await contracts.web3.eth.getTransactionReceipt(id)
  }

  // Query GraphQL for the receipt. This will include decoded event params.
  const receipt = await client.query({
    query: queries.GetReceipt,
    variables: { id }
  })

  const events = get(receipt, 'data.web3.transactionReceipt.events')
  if (!events) {
    return
  }

  // Produce a nice object in the following format:
  // { event1Name: { param1: value, param2: value }, event2Name: { param1: value } }
  const res = events.reduce((m, o) => {
    m[o.event] = o.returnValuesArr.reduce((am, ao) => {
      am[ao.field] = ao.value
      return am
    }, {})
    return m
  }, {})

  return res
}

export async function getOffer(listingId, offerIdx, checkValid) {
  const offerId = `${listingId}-${offerIdx}`
  // Get the offer through allOffers, so that contextual validation may be
  // performed across all offers for the listing.
  const res = await client.query({
    query: queries.GetAllOffers,
    variables: { id: listingId }
  })

  const offers = get(res, 'data.marketplace.listing.allOffers')
    .filter(o => o.id === offerId)
  assert.strictEqual(offers.length, 1, 'offer not found on listing')
  const offer = offers[0]
  assert.ok(offer)
  assert.strictEqual(offer.id, offerId)
  if (checkValid) {
    assert(offer.valid, 'offer validation failed')
    assert(!offer.validationError)
  }

  return offer
}
