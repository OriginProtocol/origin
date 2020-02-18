require('dotenv').config()
const config = require('./config')

const WebSocket = require('ws')

const Web3 = require('web3')
const get = require('lodash/get')

const { Network } = require('./data/db')
const handleLog = require('./utils/handleLog')

const localContract = process.env.MARKETPLACE_CONTRACT

const web3 = new Web3()

const SubscribeToNewHeads = JSON.stringify({
  jsonrpc: '2.0',
  id: 2,
  method: 'eth_subscribe',
  params: ['newHeads']
})

const SubscribeToLogs = ({ address, listingId }) => {
  const listingTopic = web3.utils.padLeft(web3.utils.numberToHex(listingId), 64)
  console.log('SubscribeToLogs', { address, listingTopic })
  return JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_subscribe',
    params: ['logs', { address, topics: [null, null, listingTopic] }]
  })
}

const GetPastLogs = ({ fromBlock, toBlock, listingId }) => {
  const listingTopic = web3.utils.padLeft(web3.utils.numberToHex(listingId), 64)
  const rpc = {
    jsonrpc: '2.0',
    id: 3,
    method: 'eth_getLogs',
    params: [
      {
        address: config.marketplace,
        topics: [null, null, listingTopic],
        fromBlock: web3.utils.numberToHex(fromBlock),
        toBlock: web3.utils.numberToHex(toBlock)
      }
    ]
  }
  return JSON.stringify(rpc)
}

const netId = config.network
let ws

async function connectWS() {
  let lastBlock
  const siteConfig = await config.getSiteConfig()
  web3.setProvider(siteConfig.provider)
  const listingId = siteConfig.listingId.split('-')[2]
  console.log(`Connecting to ${siteConfig.provider} (netId ${netId})`)
  console.log(`Watching listing ${siteConfig.listingId}`)
  const res = await Network.findOne({ where: { network_id: netId } })
  if (res) {
    lastBlock = res.last_block
    console.log(`Last recorded block: ${lastBlock}`)
  } else {
    console.log('No recorded block found')
  }

  if (ws) {
    ws.removeAllListeners()
  }

  console.log('Trying to connect...')
  ws = new WebSocket(siteConfig.provider)

  function heartbeat() {
    console.log('Got ping...')
    clearTimeout(this.pingTimeout)
    this.pingTimeout = setTimeout(() => {
      console.log('ping timeout')
      ws.terminate()
      connectWS()
    }, 30000 + 1000)
  }
  ws.heartbeat = heartbeat

  ws.on('error', err => {
    console.log('Error')
    console.error(err)
    setTimeout(() => connectWS(), 5000)
  })
  ws.on('ping', heartbeat)
  ws.on('close', function clear() {
    console.log('Connection closed')
    clearTimeout(this.pingTimeout)
  })

  ws.on('open', function open() {
    console.log('Connection open')
    this.heartbeat()
    ws.send(
      SubscribeToLogs({
        address: siteConfig.marketplaceContract || localContract,
        listingId
      })
    )
    ws.send(SubscribeToNewHeads)
  })

  const handled = {}
  let heads, logs
  ws.on('message', function incoming(raw) {
    const hash = web3.utils.sha3(raw)
    if (handled[hash]) {
      console.log('Ignoring repeated ws message')
    }
    handled[hash] = true

    const data = JSON.parse(raw)
    if (data.id === 1) {
      logs = data.result
    } else if (data.id === 2) {
      heads = data.result
    } else if (data.id === 3) {
      console.log(`Got ${data.result.length} unhandled logs`)
      data.result.map(handleLog)
    } else if (get(data, 'params.subscription') === logs) {
      handleLog(data.params.result)
    } else if (get(data, 'params.subscription') === heads) {
      const number = handleNewHead(data.params.result)
      const blockDiff = number - lastBlock
      if (blockDiff > 500) {
        console.log('Too many new blocks. Skip past log fetch.')
      } else if (blockDiff > 1 && config.fetchPastLogs) {
        console.log(`Fetching ${blockDiff} past logs...`)
        ws.send(
          GetPastLogs({ fromBlock: lastBlock, toBlock: number, listingId })
        )
      }
      lastBlock = number
    } else {
      console.log('Unknown message')
    }
  })
}

const handleNewHead = head => {
  const number = web3.utils.hexToNumber(head.number)
  const timestamp = web3.utils.hexToNumber(head.timestamp)
  console.log(`New block ${number} timestamp: ${timestamp}`)

  Network.upsert({ network_id: netId, last_block: number })

  return number
}

connectWS()
