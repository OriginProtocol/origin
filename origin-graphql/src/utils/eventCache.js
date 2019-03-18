import { get } from 'origin-ipfs'
// import { post } from 'origin-ipfs'
import uniqBy from 'lodash/uniqBy'
import chunk from 'lodash/chunk'
import flattenDeep from 'lodash/flattenDeep'
import createDebug from 'debug'

const debug = createDebug('event-cache:')

// Given a contract and block range, break the range up into requests of no
// more than 20,000 blocks, then send those requests in batches of 7.
const pastEventBatcher = async (contract, fromBlock, uptoBlock) => {
  // const start = +new Date() // Uncomment for benchmarking
  if (fromBlock > uptoBlock) throw new Error('fromBlock > toBlock')
  const partitions = []
  while (fromBlock <= uptoBlock) {
    const toBlock = Math.min(fromBlock + 20000, uptoBlock)
    partitions.push(contract.getPastEvents('allEvents', { fromBlock, toBlock }))
    fromBlock += 20000
  }
  const results = []
  const chunks = chunk(partitions, 7)
  for (const chunklet of chunks) {
    results.push(await Promise.all(chunklet))
  }
  // debug('Got events in ', +new Date() - start) // Uncomment for benchmarking
  return flattenDeep(results)
}

export default function eventCache(contract, fromBlock = 0, web3, config) {
  function padNum(num) {
    return web3.utils.padLeft(web3.utils.numberToHex(num), 64)
  }

  const queue = []
  let events = [],
    toBlock = 0,
    lastLookup = 0,
    processing = false,
    triedIpfs = false

  function updateBlock(block) {
    debug(`Update block ${block}`)
    toBlock = block
  }

  function getBlockNumber() {
    return toBlock
  }

  if (!contract.options.address) {
    return { updateBlock }
  }

  const cacheStr = `eventCache${contract.options.address.slice(2, 8)}`

  try {
    if (window.localStorage[cacheStr]) {
      ;({ events, lastLookup } = JSON.parse(window.localStorage[cacheStr])) // eslint-disable-line
      fromBlock = lastLookup
      triedIpfs = true
    }
  } catch (e) {
    /* Ignore */
  }

  const isDone = () => new Promise(resolve => queue.push(resolve))

  async function getPastEvents() {
    if (processing) {
      await isDone()
    }
    processing = true
    if (!triedIpfs && config.ipfsEventCache) {
      debug('Try IPFS cache...')
      let ipfsData
      try {
        ipfsData = await get(config.ipfsGateway, config.ipfsEventCache)
      } catch (e) {
        /* Ignore */
      }
      if (ipfsData && ipfsData.events) {
        debug('Got IPFS cache')
        // console.log(ipfsData)
        events = ipfsData.events
        lastLookup = ipfsData.lastLookup
        fromBlock = ipfsData.lastLookup
        // ({ events, lastLookup } = ipfsData)
      } else {
        debug('Error getting IPFS cache')
      }
      triedIpfs = true
    }
    if (!toBlock) {
      toBlock = await web3.eth.getBlockNumber()
    }
    if (lastLookup && lastLookup === toBlock) {
      processing = false
      return
    }
    if (lastLookup === fromBlock) {
      fromBlock += 1
    }
    debug(
      `Fetching events from ${fromBlock} to ${toBlock}, last lookup ${lastLookup}`
    )
    lastLookup = toBlock

    const newEvents = await pastEventBatcher(contract, fromBlock, toBlock)

    events = uniqBy(
      [
        ...events,
        ...newEvents.map(e => ({ ...e, block: { id: e.blockNumber } }))
      ],
      e => e.id
    )

    debug(`Found ${events.length} events, ${newEvents.length} new`)

    fromBlock = toBlock + 1
    processing = false
    while (queue.length) {
      queue.pop()()
    }

    if (typeof window !== 'undefined') {
      window.localStorage[cacheStr] = JSON.stringify({
        lastLookup,
        events
      })

      // const hash = await post(config.ipfsRPC, { events, lastLookup }, true)
      // console.log('IPFS Hash', hash)
    }
  }

  // offerIds an optional array in the format ['0-1', '1-2'] (listingId-offerId)
  async function allEvents(eventNames, party, offerIds) {
    await getPastEvents()
    if (!Array.isArray(eventNames)) {
      eventNames = eventNames ? [eventNames] : []
    }
    return events.filter(e => {
      const topics = e.raw.topics
      let matches = true
      if (eventNames && eventNames.length && eventNames.indexOf(e.event) < 0)
        matches = false

      if (offerIds && offerIds.length) {
        if (
          !offerIds.find(id => {
            const [listingId, offerId] = id.split('-')
            const listingTopic = padNum(Number(listingId)),
              offerTopic = padNum(Number(offerId))
            return topics[2] === listingTopic && topics[3] === offerTopic
          })
        ) {
          matches = false
        }
      }

      if (party) {
        if (
          topics[1].toLowerCase() !==
          web3.utils.padLeft(party, 64).toLowerCase()
        )
          matches = false
      }
      return matches
    })
  }

  async function listings(listingId, eventName, blockNumber) {
    await getPastEvents()
    const listingTopic = web3.utils.padLeft(
      web3.utils.numberToHex(listingId),
      64
    )
    return events.filter(e => {
      const topics = e.raw.topics
      let matches = topics[2] === listingTopic
      if (eventName && e.event !== eventName) matches = false
      if (blockNumber && e.blockNumber > blockNumber) matches = false
      return matches
    })
  }

  async function offers(listingIds, offerId, eventNames, notParty) {
    await getPastEvents()
    const matchListings = typeof listingIds !== 'undefined'
    if (!Array.isArray(listingIds)) {
      listingIds = matchListings ? [listingIds] : []
    }
    if (!Array.isArray(eventNames)) {
      eventNames = eventNames ? [eventNames] : []
    }
    const listingTopics = listingIds.map(listingId =>
      web3.utils.padLeft(web3.utils.numberToHex(listingId), 64)
    )

    const offerTopic =
      typeof offerId === 'number'
        ? web3.utils.padLeft(web3.utils.numberToHex(offerId), 64)
        : null

    return events.filter(e => {
      const topics = e.raw.topics

      let matchesParty = true
      if (notParty) {
        if (
          topics[1].toLowerCase() ===
          web3.utils.padLeft(notParty, 64).toLowerCase()
        )
          matchesParty = false
      }

      const matchesListing = matchListings
          ? listingTopics.indexOf(topics[2]) >= 0
          : true,
        matchesOffer = offerTopic ? topics[3] === offerTopic : true,
        matchesEvent = eventNames.length
          ? eventNames.indexOf(e.event) >= 0
          : true
      return matchesListing && matchesOffer && matchesEvent && matchesParty
    })
  }

  return { listings, offers, allEvents, updateBlock, getBlockNumber }
}
