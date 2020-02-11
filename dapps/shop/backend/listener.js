require('dotenv').config()
const config = require('./config')

const WebSocket = require('ws')
const Web3 = require('web3')
const get = require('lodash/get')

const { Op, Network, Shops } = require('./data/db')
const handleLog = require('./utils/handleLog')
const { NETWORK_ID } = require('./utils/const')
const { ListingID } = require('./utils/id')

const web3 = new Web3()

const SubscribeToNewHeads = JSON.stringify({
  jsonrpc: '2.0',
  id: 2,
  method: 'eth_subscribe',
  params: ['newHeads']
})

function makeRPCCall({ method, params = [], id = 123 }) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id,
    method,
    params
  })
}

const GetPastLogs = ({ fromBlock, toBlock, listingId }) => {
  if (!listingId || !(listingId instanceof Array)) {
    listingId = [listingId]
  }

  const calls = listingId.map(lid => {
    const listingTopic = web3.utils.padLeft(
      web3.utils.numberToHex(lid.listingId),
      64
    )
    return makeRPCCall({
      method: 'eth_getLogs',
      params: [
        {
          address: lid.address(),
          topics: [null, null, listingTopic],
          fromBlock: web3.utils.numberToHex(fromBlock),
          toBlock: web3.utils.numberToHex(toBlock)
        }
      ],
      id: 3
    })
  })

  return calls
}
const netId = NETWORK_ID
let ws

async function connectWS() {
  let lastBlock

  let wsProvider = new Web3.providers.WebsocketProvider(config.provider)
  wsProvider.on('error', e => console.log('WS Error', e))
  wsProvider.on('end', e => {
    console.log('WS closed: ', e)
    console.log('Attempting to reconnect...')
    wsProvider = new Web3.providers.WebsocketProvider(config.provider)

    wsProvider.on('connect', function() {
      console.log('WSS Reconnected')
    })

    web3.setProvider(wsProvider)
  })
  web3.setProvider(wsProvider)

  console.log(`Connecting to ${config.provider} (netId ${netId})`)

  try {
    const res = await Network.findOne({ where: { networkId: netId } })
    if (res) {
      lastBlock = res.lastBlock
      console.log(`Last recorded block: ${lastBlock}`)
    } else {
      console.log('No recorded block found')
    }
  } catch (err) {
    console.error('Error looking up network')
    console.error(err)
  }

  if (ws) {
    ws.removeAllListeners()
  }

  console.log('Trying to connect...')
  ws = new WebSocket(config.provider)

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
  ws.on('close', function clear(num, reason) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    console.error(`Websocket connection closed: ${num}: ${reason}`)
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

    if (num !== 1006) {
      // 1006 may be a fault, allow reconnect
      console.log('clearing reconnect timeout.  shutting down...')
      clearTimeout(this.pingTimeout)
      process.exit(1)
    }
  })

  ws.on('open', function open() {
    console.log('Connection open')
    this.heartbeat()
    // TODO: Why eth_subscribe (logs on address) AND eth_getLogs?
    //ws.send(SubscribeToLogs(siteConfig.marketplaceContract || localContract, listingId))
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
      if (data.result) {
        console.log(`Got ${data.result.length} unhandled logs`)
        data.result.map(handleLog)
      } else {
        console.error('Unknown response format for eth_getLogs: ', data)
      }
    } else if (get(data, 'params.subscription') === logs) {
      handleLog(data.params.result)
    } else if (get(data, 'params.subscription') === heads) {
      const number = handleNewHead(data.params.result)
      const blockDiff = number - lastBlock
      if (blockDiff > 500) {
        console.log('Too many new blocks. Skip past log fetch.')
      } else if (blockDiff >= 1) {
        // Removed config.fetchPastLogs because that's not a thing
        Shops.findAll({
          attributes: ['listingId'],
          where: {
            listingId: {
              [Op.ne]: null
            }
          }
        })
          .then(rows => {
            // Unique ListingIDs
            const listingId = rows
              .reduce((acc, cur) => {
                if (!acc.includes(cur.listingId)) acc.push(cur.listingId)
                return acc
              }, [])
              .map(fqlid => ListingID.fromFQLID(fqlid))

            console.log(
              `Fetching ${blockDiff} past blocks of logs for ${listingId.length} listings...`
            )

            // TODO: At what point does the amount of params make this query difficult?
            const rpcCalls = GetPastLogs({
              fromBlock: lastBlock,
              toBlock: number,
              listingId
            })
            for (const call of rpcCalls) {
              ws.send(call)
            }
          })
          .catch(err => {
            console.error(err)
          })
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

  Network.upsert({ networkId: netId, lastBlock: number })

  return number
}

connectWS()
