require('dotenv').config()
const program = require('commander')

const Web3 = require('web3')
const web3 = new Web3()
const range = require('lodash/range')
const flattenDeep = require('lodash/flattenDeep')
const Bottleneck = require('bottleneck')
const fetch = require('node-fetch')
const get = require('lodash/get')

const { Shops } = require('../data/db')
const { CONTRACTS } = require('../utils/const')
const { storeEvents, getEventObj } = require('../utils/events')

// const handleLog = require('../utils/handleLog')

const limiter = new Bottleneck({ maxConcurrent: 10 })
const batchSize = 5000
const Provider = process.env.PROVIDER_HTTP

program.requiredOption('-l, --listing <listingId>', 'Listing ID')

program.parse(process.argv)

async function getLogs({ listingId, address, fromBlock, toBlock }) {
  const listingTopic = web3.utils.padLeft(web3.utils.numberToHex(listingId), 64)
  const rpc = {
    jsonrpc: '2.0',
    id: 3,
    method: 'eth_getLogs',
    params: [
      {
        address,
        topics: [null, null, listingTopic],
        fromBlock: web3.utils.numberToHex(fromBlock),
        toBlock: web3.utils.numberToHex(toBlock)
      }
    ]
  }

  console.log(`Fetching logs ${fromBlock}-${toBlock}`)
  const body = JSON.stringify(rpc)
  const res = await fetch(Provider, { method: 'POST', body })
  const resJson = await res.json()
  return resJson.result
}

async function fetchEvents(listingIdFull) {
  if (!String(listingIdFull).match(/^[0-9]+-[0-9]+-[0-9]+$/)) {
    console.log('Invalid Listing ID. Must be xxx-xxx-xxx eg 1-001-123')
    return
  }

  const [networkId, contractId, listingId] = listingIdFull.split('-')

  const shop = await Shops.findOne({ listingId })
  if (!shop) {
    console.log('No shop with that ID')
    return
  }

  const contract = get(CONTRACTS, `${networkId}.marketplace.${contractId}`)
  if (!contract) {
    console.log('Could not find contract address')
    return
  }

  web3.setProvider(Provider)

  const currentNet = await web3.eth.net.getId()

  if (currentNet !== Number(networkId)) {
    console.log(`Provider is not on network ${networkId}`)
    return
  }

  console.log(currentNet)
  console.log(contract)
  console.log(shop.dataValues)

  let events = []

  const latestBlock = await web3.eth.getBlockNumber()

  // Fetch all events from inspected block until latest block
  if (shop.lastBlock) {
    const toBlock = latestBlock
    const fromBlock = shop.lastBlock + 1
    const requests = range(fromBlock, toBlock + 1, batchSize).map(start =>
      limiter.schedule(args => getLogs(args), {
        fromBlock: start,
        toBlock: Math.min(start + batchSize - 1, toBlock),
        listingId,
        address: contract
      })
    )

    const numBlocks = toBlock - fromBlock + 1
    console.log(`Get ${numBlocks} blocks in ${requests.length} requests`)

    if (!numBlocks) return

    const eventsChunks = await Promise.all(requests)
    events = flattenDeep(eventsChunks)
    console.log(`Got ${events.length} new events`)

    storeEvents({ events, shopId: shop.id, networkId })

    shop.lastBlock = latestBlock
    await shop.save()
    console.log('Saved shop')
  } else {
    // Fetch all events from current block going back until we find ListingCreated event
    console.log(`Fetching all events ending block ${latestBlock}`)
    let listingCreatedEvent
    let fromBlock = latestBlock
    do {
      const toBlock = fromBlock - 1
      fromBlock -= batchSize
      const batchEvents = await getLogs({
        fromBlock,
        toBlock,
        listingId,
        address: contract
      })

      console.log(`Found ${batchEvents.length} events`)

      storeEvents({ events: batchEvents, shopId: shop.id, networkId })

      listingCreatedEvent = batchEvents
        .map(e => getEventObj(e))
        .find(o => o.eventName === 'ListingCreated')
    } while (!listingCreatedEvent)

    if (listingCreatedEvent) {
      shop.firstBlock = listingCreatedEvent.blockNumber
      shop.lastBlock = latestBlock
      await shop.save()
      console.log('Saved shop')
    }
  }
}

fetchEvents(program.listing)
