require('dotenv').config()
const program = require('commander')

const Web3 = require('web3')
const web3 = new Web3()
const range = require('lodash/range')
const flattenDeep = require('lodash/flattenDeep')
const Bottleneck = require('bottleneck')
const fetch = require('node-fetch')
const get = require('lodash/get')

const { sequelize, Shop, Network, Event } = require('../models')
const { CONTRACTS } = require('../utils/const')
const { storeEvents, getEventObj } = require('../utils/events')

const { insertOrderFromEvent } = require('../utils/handleLog')

const limiter = new Bottleneck({ maxConcurrent: 10 })
const batchSize = 5000

program.requiredOption('-l, --listing <listingId>', 'Listing ID')

program.parse(process.argv)

async function getLogs({ provider, listingId, address, fromBlock, toBlock }) {
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
  const res = await fetch(provider, { method: 'POST', body })
  const resJson = await res.json()
  return resJson.result
}

function extractListing(listingIdFull) {
  if (!String(listingIdFull).match(/^[0-9]+-[0-9]+-[0-9]+$/)) {
    throw new Error('Invalid Listing ID. Must be xxx-xxx-xxx eg 1-001-123')
  }
  console.log(`Fetching events for listing ${listingIdFull}`)

  const [networkId, contractId, listingId] = listingIdFull.split('-')
  return { networkId, contractId, listingId }
}

async function extractVars(listingIdFull) {
  const [networkId] = listingIdFull.split('-')
  const network = await Network.findOne({ where: { networkId } })
  if (!network) {
    throw new Error(`No network with ID ${networkId}`)
  }
  if (!network.provider) {
    throw new Error(`Network ${networkId} has no provider set`)
  }
  console.log(`Using provider ${network.provider}`)

  const shop = await Shop.findOne({ where: { listingId: listingIdFull } })
  if (!shop) {
    throw new Error(`No shop with listing ID ${listingIdFull}`)
  }
  console.log(`Found shop ${shop.id} with listing ${shop.listingId}`)

  return { network, shop }
}

async function fetchEvents(listingIdFull) {
  const { networkId, contractId, listingId } = extractListing(listingIdFull)
  const { network, shop } = await extractVars(listingIdFull)

  const { minBlock, maxBlock } = await Event.findOne({
    raw: true,
    where: { shopId: shop.id },
    attributes: [
      [sequelize.fn('MIN', sequelize.col('block_number')), 'minBlock'],
      [sequelize.fn('MAX', sequelize.col('block_number')), 'maxBlock']
    ]
  })
  if (minBlock) {
    console.log(`Earliest event at block ${minBlock}, latest ${maxBlock}`)
  }

  const listingCreatedEvent = await Event.findOne({
    raw: true,
    where: { shopId: shop.id, eventName: 'ListingCreated' },
    attributes: ['block_number']
  })
  if (listingCreatedEvent) {
    console.log(`ListingCreated at block ${listingCreatedEvent.block_number}`)
  } else {
    console.log('No ListingCreated event')
  }

  const contract = get(CONTRACTS, `${networkId}.marketplace.${contractId}`)
  if (!contract) {
    console.log('Could not find contract address')
    return
  }

  web3.setProvider(network.provider)

  let events = []

  const latestBlock = await web3.eth.getBlockNumber()
  console.log(`Latest block is ${latestBlock}`)

  // Fetch all events from inspected block until latest block
  if (listingCreatedEvent) {
    const toBlock = latestBlock
    const fromBlock = maxBlock + 1
    const requests = range(fromBlock, toBlock + 1, batchSize).map(start =>
      limiter.schedule(args => getLogs(args), {
        fromBlock: start,
        toBlock: Math.min(start + batchSize - 1, toBlock),
        listingId,
        address: contract,
        provider: network.provider
      })
    )

    const numBlocks = toBlock - fromBlock + 1
    console.log(`Get ${numBlocks} blocks in ${requests.length} requests`)

    if (!numBlocks) return

    const eventsChunks = await Promise.all(requests)
    events = flattenDeep(eventsChunks)
    console.log(`Got ${events.length} new events`)

    storeEvents({ web3, events, shopId: shop.id, networkId })
  } else {
    // Fetch all events from current block going back until we find ListingCreated event
    console.log(`Fetching all events ending block ${latestBlock}`)
    let listingCreatedEvent
    let fromBlock = minBlock || latestBlock
    do {
      const toBlock = fromBlock - 1
      fromBlock -= batchSize
      const batchEvents = await getLogs({
        fromBlock,
        toBlock,
        listingId,
        address: contract,
        provider: network.provider
      })

      console.log(`Found ${batchEvents.length} events`)

      storeEvents({ web3, events: batchEvents, shopId: shop.id, networkId })

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

async function handleEvents(listingIdFull) {
  const { shop } = await extractVars(listingIdFull)

  const events = await Event.findAll({
    where: { shopId: shop.id },
    order: [['block_number', 'ASC']]
  })
  for (const event of events) {
    await insertOrderFromEvent({
      offerId: `${listingIdFull}-${event.offerId}`,
      event,
      shop
    })
  }
}

function go() {
  fetchEvents(program.listing)
  handleEvents(program.listing)
}

module.exports = {
  go, fetchEvents, handleEvents
}