'use strict'

import '@babel/polyfill'
import bodyParser from 'body-parser'
import express from 'express'
import expressWs from 'express-ws'
import fetch from 'cross-fetch'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import Web3 from 'web3'
import db from './models'
import logger from './logger'

const esmImport = require('esm')(module)
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')

import { verifyNewMessageSignature, verifyRegistrySignature } from './verify'

import * as config from './config'

import _redis from 'redis'

const redis = _redis.createClient(process.env.REDIS_URL)

setNetwork(process.env.NETWORK ? process.env.NETWORK : 'localhost')

async function isContract(address) {
  const code = await contractsContext.web3.eth.getCode(address)
  return code && code.length > 2
}

// supply an endpoint for querying global registry
const app = express()
expressWs(app)
app.use(bodyParser.json())
const port = 6647
// limit request to one per minute
const rateLimiterOptions = {
  points: 1,
  duration: 60
}
const rateLimiter = new RateLimiterMemory(rateLimiterOptions)

// should be tightened up for security
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )

  next()
})

app.all((req, res, next) => {
  rateLimiter
    .consume(req.connection.remoteAddress)
    .then(() => {
      next()
    })
    .catch(() => {
      res.status(429).send('<h1>Too Many Requests</h1>')
    })
})

app.get('/', async (req, res) => {
  const markup =
    '<h1>Origin Messaging</h1>' +
    '<h2><a href="https://medium.com/originprotocol/introducing-origin-messaging-decentralized-secure-and-auditable-13c16fe0f13e">Learn More</a></h2>'

  res.send(markup)
})

app.get('/accounts', async (req, res) => {
  const count = db.Registry.count()

  res.send({ count })
})

// Returns a user's public key and signature  object
app.get('/accounts/:address', async (req, res) => {
  let { address } = req.params

  if (!Web3.utils.isAddress(address)) {
    res.statusMessage = `Address '${address}' is not a valid Ethereum address`

    return res.status(400).end()
  }

  address = Web3.utils.toChecksumAddress(address)

  // If it's a proxy, make sure we're checking with the owner account address
  if (await isContract(address)) {
    console.log(`${address} is a proxy!`)
    return res.status(400).send('Invalid account (contract)')
  } else {
    console.log(`${address} is not a proxy!`)
  }

  const entry = await db.Registry.findOne({ where: { ethAddress: address } })

  if (!entry) {
    return res.status(204).end()
  }

  res.status(200).send(entry.data)
})

// Set a user's public key and signature  object
app.post('/accounts/:address', async (req, res) => {
  let { address } = req.params

  if (!Web3.utils.isAddress(address)) {
    res.statusMessage = `Address '${address}' is not a valid Ethereum address`

    return res.status(400).end()
  }

  address = Web3.utils.toChecksumAddress(address)

  // If it's a proxy, make sure we're checking with the owner account address
  if (await isContract(address)) {
    return res.status(400).send('Invalid account (contract)')
  } else {
    console.log(`${address} is not a proxy!`)
  }

  const { signature, data } = req.body

  if (
    verifyRegistrySignature(signature, '', {
      payload: { value: data, key: address }
    })
  ) {
    const entry = await db.Registry.findOne({ where: { ethAddress: address } })
    console.log('setting registry existing entry:', entry)
    if (!entry || entry.signature != signature) {
      await db.Registry.upsert({ ethAddress: address, data, signature })
    }
    return res.status(200).send(address)
  }
  res.statusMessage = 'Cannot verify signature of registry'
  return res.status(400).end()
})

// Fetch basic information about conversations for an account
app.get('/conversations/:address', async (req, res) => {
  let { address } = req.params

  if (!Web3.utils.isAddress(address)) {
    res.statusMessage = `Address '${address}' is not a valid Ethereum address`

    return res.status(400).end()
  }

  address = Web3.utils.toChecksumAddress(address)

  const convs = await db.Conversee.findAll({
    where: { ethAddress: address },
    include: [{ model: db.Conversation }]
  })

  if (!convs) {
    return res.status(204).end()
  }

  res.status(200).send(
    convs.map(c => {
      return {
        id: c.Conversation.externalId,
        count: c.Conversation.messageCount
      }
    })
  )
})

// Get all messages in a room/conversation
app.get('/messages/:conversationId', async (req, res) => {
  const { conversationId } = req.params

  const messages = await db.Message.findAll({
    include: [
      { model: db.Conversation, where: { externalId: conversationId } }
    ],
    order: [['conversationIndex', 'ASC']]
  })

  if (!messages) {
    return res.status(204).end()
  }

  res.status(200).send(
    messages.map(m => {
      return {
        conversationIndex: m.conversationIndex,
        address: m.ethAddress,
        content: m.data.content,
        ext: m.data.ext,
        signature: m.signature,
        isKeys: m.isKeys,
        timestamp: m.createdAt
      }
    })
  )
})

// Add a message to a room/conversation
app.post('/messages/:conversationId/:conversationIndex', async (req, res) => {
  const { conversationId } = req.params
  const conversationIndex = Number(req.params.conversationIndex)
  const { signature, content } = req.body
  const { address } = content
  let conv_addresses = conversationId ? conversationId.split('-') : null

  const entry = await db.Registry.findOne({ where: { ethAddress: address } })

  // Don't allow a user to message themselves.  It's weird.
  if (
    conv_addresses &&
    conv_addresses.length === 2 &&
    conv_addresses[0].toLowerCase() === conv_addresses[1].toLowerCase()
  ) {
    return res.status(401).send('Unable to message self.')
  }

  // If it's a proxy, make sure we're checking with the owner account address
  if (await isContract(conv_addresses[0]) || await isContract(conv_addresses[1])) {
    return res.status(400).send('Invalid account (contract)')
  } else {
    console.log(`participant is not a proxy!`)
  }

  if (
    !verifyNewMessageSignature(
      signature,
      conversationId,
      conversationIndex,
      content,
      entry.data.address
    )
  ) {
    return res.status(401).send('Signature verification failed.')
  }

  const conv = await db.Conversation.findOne({
    where: { externalId: conversationId }
  })

  const contentHash = Web3.utils.sha3(JSON.stringify(content))

  let message
  if (!conv) {
    //let's create a conversation...
    if (!conv_addresses.includes(address)) {
      return res
        .status(401)
        .send('One of the conversers involved must initiate the conversation.')
    }
    if (conversationIndex != 0) {
      return res.status(409).end()
    } else if (content.type != 'keys') {
      return res
        .status(400)
        .send('Conversations must be initiated by a keys exchange')
    }

    await db.sequelize.transaction(async t => {
      const conversation = await db.Conversation.create(
        { externalId: conversationId, messageCount: 1 },
        { transaction: t }
      )
      for (const converser of conv_addresses) {
        await db.Conversee.create(
          { conversationId: conversation.id, ethAddress: converser },
          { transaction: t }
        )
      }
      message = await db.Message.create(
        {
          conversationId: conversation.id,
          conversationIndex,
          ethAddress: address,
          data: { content },
          contentHash,
          signature,
          isKeys: true
        },
        { transaction: t }
      )
      return message
    })
  } else {
    const conversees = await db.Conversee.findAll({
      where: { conversationId: conv.id }
    })
    conv_addresses = conversees.map(c => c.ethAddress)

    if (!conv_addresses.includes(address)) {
      return res
        .status(401)
        .send(`Address '${address}' not part of current conversation.`)
    }

    //create a message that's the correct sequence
    await db.sequelize.transaction(async t => {
      const conversation = await db.Conversation.findOne({
        where: { externalId: conversationId },
        transaction: t,
        lock: t.LOCK.UPDATE
      })
      if (conversationIndex != conversation.messageCount) {
        return false
      }
      message = await db.Message.create(
        {
          conversationId: conversation.id,
          conversationIndex: conversation.messageCount,
          ethAddress: address,
          data: { content },
          contentHash,
          signature,
          isKeys: content.type == 'keys'
        },
        { transaction: t }
      )
      conversation.messageCount += 1
      return conversation.save({ transaction: t })
    })
  }

  if (message) {
    // Publish messages to be consumed by the websocket(below)
    for (const notify_address of conv_addresses) {
      // Push to redis
      await redis.publish(
        notify_address,
        JSON.stringify({
          content,
          timestamp: message.createdAt,
          conversationIndex,
          conversationId
        })
      )
    }

    // Send to notifications server
    // e.g. http://localhost:3456/messages
    if (config.NOTIFICATIONS_ENDPOINT_URL) {
      const sender = address

      // Filter out the sender
      const receivers = conv_addresses.filter(a => a != address)
      fetch(config.NOTIFICATIONS_ENDPOINT_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender,
          receivers,
          messageHash: contentHash
        })
      })
    }

    // TODO: Remove. Linker not used anymore
    if (config.LINKING_NOTIFY_ENDPOINT) {
      const sender = address
      const recievers = conv_addresses.filter(a => a != address)
      fetch(config.LINKING_NOTIFY_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender,
          recievers, // YES, This spelling is wrong
          token: config.LINKING_NOTIFY_TOKEN
        })
      })
    }

    return res.status(200).send({ created: 1 })
  } else {
    return res.status(400).send('cannot create message')
  }
})

// Websocket to listen for new messages
app.ws('/message-events/:address', (ws, req) => {
  const { address } = req.params
  const redis_sub = redis.duplicate()
  redis_sub.subscribe(address)

  const msg_handler = (channel, msg) => {
    ws.send(msg)
  }

  redis_sub.on('message', msg_handler)

  ws.on('close', () => {
    console.log('closing ws:', address)
    redis_sub.quit()
  })
})

app.listen(port, () => {
  logger.debug(`REST endpoint listening on port ${port}`)
})
