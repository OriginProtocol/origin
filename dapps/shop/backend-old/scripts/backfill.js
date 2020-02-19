require('dotenv').config()
const program = require('commander')

const Web3 = require('web3')
const web3 = new Web3()
const range = require('lodash/range')
const flattenDeep = require('lodash/flattenDeep')
const Bottleneck = require('bottleneck')
const fetch = require('node-fetch')

const handleLog = require('../utils/handleLog')

const limiter = new Bottleneck({ maxConcurrent: 10 })
const batchSize = 5000
const Provider = process.env.PROVIDER_HTTP

program
  .requiredOption('-f, --from <blockId>', 'From block')
  .requiredOption('-t, --to <blockId>', 'To block')
  .requiredOption('-l, --listing <listingId>', 'Listing ID')

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
  const res = await fetch(Provider, {
    method: 'POST',
    body: JSON.stringify(rpc)
  })
  const data = await res.json()
  return data.result
}

async function fetchEvents({ fromBlock, toBlock, listingId, address }) {
  const requests = range(fromBlock, toBlock + 1, batchSize).map(start =>
    limiter.schedule(args => getLogs(args), {
      fromBlock: start,
      toBlock: Math.min(start + batchSize - 1, toBlock),
      listingId,
      address
    })
  )

  const numBlocks = toBlock - fromBlock + 1
  console.log(`Get ${numBlocks} blocks in ${requests.length} requests`)

  if (!numBlocks) return

  const newEvents = flattenDeep(await Promise.all(requests))
  console.log(`Got ${newEvents.length} new events`)

  for (const event of newEvents) {
    await handleLog(event)
  }
}

fetchEvents({
  fromBlock: Number(program.from),
  toBlock: Number(program.to),
  listingId: Number(program.listing),
  address: '0x698ff47b84837d3971118a369c570172ee7e54c2'
})
