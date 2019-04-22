import { get } from '@origin/ipfs'
// import { post } from '@origin/ipfs'
import uniqBy from 'lodash/uniqBy'
import chunk from 'lodash/chunk'
import flattenDeep from 'lodash/flattenDeep'
import createDebug from 'debug'
import LZString from 'lz-string'

const debug = createDebug('generic-event-cache:')

const pastEventBatcher = async (contract, fromBlock, uptoBlock) => {
  // const start = +new Date() // Uncomment for benchmarking
  if (fromBlock > uptoBlock) throw new Error('fromBlock > toBlock')
  const partitions = []
  while (fromBlock <= uptoBlock) {
    const toBlock = Math.min(fromBlock + 3000, uptoBlock)
    partitions.push(contract.getPastEvents('allEvents', { fromBlock, toBlock }))
    fromBlock += 3000
  }
  const results = []
  const chunks = chunk(partitions, 7)
  for (const chunklet of chunks) {
    results.push(await Promise.all(chunklet))
  }
  // debug('Got events in ', +new Date() - start) // Uncomment for benchmarking
  return flattenDeep(results)
}


export default function eventCache(
  contract,
  fromBlock = 0,
  web3,
  config,
  ipfsEventCache
) {
  // function padNum(num) {
  //   return web3.utils.padLeft(web3.utils.numberToHex(num), 64)
  // }

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
      let str = window.localStorage[cacheStr]
      if (str[0] !== '{') {
        str = LZString.decompress(str)
      }
      const parsed = JSON.parse(str)
      events = parsed.events
      lastLookup = fromBlock = parsed.lastLookup
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
        ipfsData = await get(config.ipfsGateway, ipfsEventCache)
        if (ipfsData.compressed) {
          const decompressed = LZString.decompress(ipfsData.compressed)
          ipfsData = JSON.parse(decompressed)
        }
      } catch (e) {
        /* Ignore */
      }
      if (ipfsData && ipfsData.events) {
        debug('Got IPFS cache')
        events = ipfsData.events
        lastLookup = ipfsData.lastLookup
        fromBlock = ipfsData.lastLookup
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
      const compressed = LZString.compress(
        JSON.stringify({
          lastLookup,
          events
        })
      )
      window.localStorage[cacheStr] = compressed

      // const hash = await post(config.ipfsRPC, { compressed }, true)
      // console.log('IPFS Hash', hash)
    }
  }

  async function allEvents(eventNames, filterTopics = []) {
    await getPastEvents()
    if (!Array.isArray(eventNames)) {
      eventNames = eventNames ? [eventNames] : []
    }
    const filteredEvents = events.filter(e => {
      const topics = e.raw.topics
      let matches = true
      if (eventNames && eventNames.length && eventNames.indexOf(e.event) < 0) {
        matches = false
      }
      if (filterTopics[0]) {
        matches = topics[0] === filterTopics[0]
      }
      if (filterTopics[1]) {
        matches = topics[1] === filterTopics[1]
      }
      return matches
    })

    return filteredEvents
  }

  return { allEvents, updateBlock, getBlockNumber }
}
