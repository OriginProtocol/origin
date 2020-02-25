require('dotenv').config()

const ReconnectingWebSocket = require('reconnecting-websocket')
const WebSocket = require('ws')

const Web3 = require('web3')
const get = require('lodash/get')
const isEqual = require('lodash/isEqual')

const { Op, Network, Shops } = require('./data/db')
const handleLog = require('./utils/handleLog')
const { CONTRACTS, PROVIDER, PROVIDER_WS } = require('./utils/const')

const web3 = new Web3(PROVIDER)

let networkId, listingIds, ws

const SubscribeToNewHeads = JSON.stringify({
  jsonrpc: '2.0',
  id: 2,
  method: 'eth_subscribe',
  params: ['newHeads']
})

const SubscribeToLogs = ({ address, listingIds }) => {
  const listingTopics = listingIds.map(listingId => {
    return web3.utils.padLeft(web3.utils.numberToHex(listingId), 64)
  })

  return JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_subscribe',
    params: ['logs', { address, topics: [null, null, listingTopics] }]
  })
}

const GetPastLogs = ({ address, fromBlock, toBlock, listingIds }) => {
  const listingTopics = listingIds.map(listingId => {
    return web3.utils.padLeft(web3.utils.numberToHex(listingId), 64)
  })
  const rpc = {
    jsonrpc: '2.0',
    id: 3,
    method: 'eth_getLogs',
    params: [
      {
        address,
        topics: [null, null, listingTopics],
        fromBlock: web3.utils.numberToHex(fromBlock),
        toBlock: web3.utils.numberToHex(toBlock)
      }
    ]
  }
  return JSON.stringify(rpc)
}

async function connectWS() {
  let lastBlock, pingTimeout
  const res = await Network.findOne({ where: { networkId } })
  if (res) {
    lastBlock = res.last_block
    console.log(`Last recorded block: ${lastBlock}`)
  } else {
    console.log('No recorded block found')
  }

  const contractVersion = '001' // Hardcoded for now
  const address = get(CONTRACTS, `${networkId}.marketplace.${contractVersion}`)

  console.log(`Connecting to ${PROVIDER_WS} (netId ${networkId})`)
  console.log(
    `Watching listings ${listingIds.join(', ')} on contract ${address}`
  )

  if (ws) {
    clearTimeout(pingTimeout)
    ws.close()
  }

  console.log('Trying to connect...')
  ws = new ReconnectingWebSocket(PROVIDER_WS, [], { WebSocket })

  function heartbeat() {
    clearTimeout(pingTimeout)
    pingTimeout = setTimeout(() => {
      console.log('WS Ping timeout! Reconnecting...')
      ws.reconnect()
    }, 30000 + 5000)
  }

  ws.addEventListener('error', err => {
    console.log('WS error:', err.message)
  })
  ws.addEventListener('close', function clear() {
    console.log('WS closed.')
  })

  ws.addEventListener('open', function open() {
    console.log('WS open.')
    heartbeat()
    ws._ws.on('ping', () => {
      console.log('WS ping.')
      heartbeat()
    })
    ws.send(SubscribeToLogs({ address, listingIds }))
    ws.send(SubscribeToNewHeads)
  })

  const handled = {}
  let heads, logs
  ws.addEventListener('message', async function incoming(raw) {
    raw = raw.data

    const hash = web3.utils.sha3(raw)
    if (handled[hash]) {
      console.log('Ignoring repeated ws message')
    }
    handled[hash] = true

    const latestListings = await getListingIds()
    if (!isEqual(latestListings, listingIds)) {
      console.log('Change in listings detected. Restarting listener...')
      listingIds = latestListings
      connectWS()
      return
    }

    const data = JSON.parse(raw)
    if (data.id === 1) {
      // Store subscription ID for Logs
      logs = data.result
    } else if (data.id === 2) {
      heads = data.result
    } else if (data.id === 3) {
      console.log(`Got ${data.result.length} unhandled logs`)
      data.result.map(result =>
        handleLog({ ...result, address, networkId, contractVersion })
      )
    } else if (get(data, 'params.subscription') === logs) {
      handleLog({ ...data.params.result, networkId, address, contractVersion })
    } else if (get(data, 'params.subscription') === heads) {
      const number = handleNewHead(data.params.result, networkId)
      const blockDiff = number - lastBlock
      if (blockDiff > 500) {
        console.log('Too many new blocks. Skip past log fetch.')
      } else if (blockDiff > 1) {
        console.log(`Fetching ${blockDiff} past logs...`)
        ws.send(
          GetPastLogs({ fromBlock: lastBlock, toBlock: number, listingIds })
        )
      }
      lastBlock = number
    } else {
      console.log('Unknown message')
    }
  })
}

const handleNewHead = (head, networkId) => {
  const number = web3.utils.hexToNumber(head.number)
  const timestamp = web3.utils.hexToNumber(head.timestamp)

  Network.upsert({ networkId, last_block: number })
  console.log(`New block ${number} timestamp: ${timestamp}`)

  return number
}

async function getListingIds() {
  const shops = await Shops.findAll({
    attributes: ['listingId'],
    group: ['listingId'],
    where: { networkId, listingId: { [Op.ne]: null } }
  })

  return shops.map(shop => shop.listingId.split('-')[2])
}

async function start() {
  networkId = await web3.eth.net.getId()
  listingIds = await getListingIds()
  connectWS()
}

start()
