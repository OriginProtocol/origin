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
const { isContract } = esmImport('@origin/graphql/src/utils/proxy')
const { setNetwork } = esmImport('@origin/graphql/src/contracts')

import { verifyNewMessageSignature, verifyRegistrySignature } from './verify'

import * as config from './config'

import _redis from 'redis'

const redis = _redis.createClient(process.env.REDIS_URL)

setNetwork(process.env.NETWORK ? process.env.NETWORK : 'localhost')

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
  const count = await db.Registry.count()

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
    verifyRegistrySignature(signature, {
      payload: {
        value: data,
        key: address
      }
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

// Fetch total unread message count of an address
app.get('/conversations/:address/unread', async (req, res) => {
  let { address } = req.params

  if (!Web3.utils.isAddress(address)) {
    res.statusMessage = `Address '${address}' is not a valid Ethereum address`

    return res.status(400).end()
  }

  address = Web3.utils.toChecksumAddress(address)

  // TODO: Get rid of the custom query and find the correct ORM way

  try {
    const [[convs]] = await db.sequelize.query(
      `
SELECT SUM(unread) as unread FROM (SELECT messages.unread_count::integer as unread FROM msg_conversee conversee
  LEFT JOIN 
    (SELECT m.conversation_id, count(m.conversation_id)::integer as unread_count 
      FROM msg_message m 
      WHERE m.read=False AND m.is_keys=False
        AND m.eth_address<>:address
      GROUP BY m.conversation_id) messages
    ON messages.conversation_id=conversee.conversation_id
  WHERE conversee.eth_address=:address) unread_by_conv`,
      {
        replacements: {
          address
        }
      }
    )

    return res.status(200).send(convs)
  } catch (e) {
    return res.status(500).send(e)
  }
})

// Fetch basic information about conversations for an account
app.get('/conversations/:address', async (req, res) => {
  let { address } = req.params
  const { limit, offset } = {
    limit: 10,
    offset: 0,
    ...req.query
  }

  if (!Web3.utils.isAddress(address)) {
    res.statusMessage = `Address '${address}' is not a valid Ethereum address`

    return res.status(400).end()
  }

  address = Web3.utils.toChecksumAddress(address)

  // TODO: Get rid of the custom query and find the correct ORM way

  // // Limit to 10 conversations per query
  // const limit = after ? undefined : 10

  // const conversationWhere = {}
  // const constraints = {}
  // if (after) {
  //   constraints[db.Sequelize.Op.gt] = new Date(after)
  // }

  // if (before) {
  //   constraints[db.Sequelize.Op.lt] = new Date(before)
  // }

  // if (before || after) {
  //   conversationWhere.updatedAt = constraints
  // }

  // const convs = await db.Conversee.findAll({
  //   where: { ethAddress: address },
  //   include: [{
  //     model: db.Conversation,
  //     where: conversationWhere,
  //     as: 'conversations',
  //     include: [{
  //       model: db.Message,
  //       as: 'messages',
  //       where: {
  //         read: false
  //       }
  //     }],
  //     // attributes: {
  //     //   include: [
  //     //     [db.Sequelize.fn('COUNT', db.Sequelize.col('msg_message.id'), 'unreadCount')]
  //     //   ]
  //     // }
  //     // include: [{
  //     //   model: db.Message,
  //     //   // attributes: [],
  //     //   where: {
  //     //     read: false
  //     //   }
  //     // }]
  //   }],
  //   order: [[db.Conversation, 'updatedAt', 'DESC']],
  //   limit
  // })

  try {
    const [convs] = await db.sequelize.query(
      `
SELECT conversations.external_id as id, conversations.updated_at as timestamp, conversations.message_count as count, messages.unread_count as unread FROM msg_conversee conversee 
  INNER JOIN msg_conversation conversations 
    ON conversations.id=conversee.conversation_id 
  LEFT JOIN 
    (SELECT m.conversation_id, count(m.conversation_id)::integer as unread_count 
      FROM msg_message m 
      WHERE m.read=False AND m.is_keys=False
        AND m.eth_address<>:address
      GROUP BY m.conversation_id) messages
    ON messages.conversation_id=conversations.id
  WHERE conversee.eth_address=:address
  ORDER BY conversations.updated_at DESC
  LIMIT :limit OFFSET :offset`,
      {
        replacements: {
          address,
          limit,
          offset
        }
      }
    )

    return res.status(200).send(convs)
  } catch (e) {
    return res.status(500).send(e)
  }
})

// Mark the conversation as read
app.post('/messages/:conversationId/read', async (req, res) => {
  const { conversationId } = req.params

  const conversation = await db.Conversation.findOne({
    where: {
      externalId: conversationId
    }
  })

  if (!conversation) {
    return res.status(404).send({
      success: false,
      errors: 'Conversation not found'
    })
  }

  const address = Web3.utils.toChecksumAddress(req.query.address)

  const [messagesRead] = await db.Message.update(
    {
      read: true
    },
    {
      where: {
        conversationId: conversation.id,
        ethAddress: {
          [db.Sequelize.Op.not]: address
        },
        read: false
      }
    }
  )

  await redis.publish(
    address,
    JSON.stringify({
      type: 'MARKED_AS_READ',
      address,
      conversationId,
      messagesRead
    })
  )

  return res.status(200).send({
    success: true,
    messagesRead
  })
})

/**
 * Returns paginated results of messages in a given conversation
 * @param {String} args.conversationId - Conversation ID
 * @param {Integer} args.after - To get messages with converstationIndex > after
 * @param {Integer} args.before - To get messages with converstationIndex < before
 * @param {Integer} args.isKeys - Returns only keys if true, otherwise returns all other messages
 * @param {Integer} args.read - To filter messages based on read status
 * @param {Integer} args.returnCount - Returns only the count, if true.
 * @returns {Promise<[Object]>|Integer} Returns count of records if returnCount is true. Otherwise, returns an array of message objects.
 *                                      Array will be empty if no messages matched the given constraint.
 */
async function getMessages({
  returnCount,
  conversationId,
  after,
  before,
  isKeys,
  read
}) {
  const where = {
    isKeys
  }

  if (!isKeys) {
    // Don't paginate when fetching keys
    const constraints = {}

    if (after) {
      constraints[db.Sequelize.Op.gt] = parseInt(after)
    }

    if (before) {
      constraints[db.Sequelize.Op.lt] = parseInt(before)
    }

    if (before || after) {
      where.conversationIndex = constraints
    }

    if (read === 'true' || read === 'false') {
      where.read = read === 'true'
    }
  }

  // Don't paginate messages if `after` is specified
  // Don't paginate when fetching keys or count of messages
  // Limit 10 per query otherwise
  const limit = returnCount || isKeys || after ? undefined : 10

  const queryOpts = {
    include: [
      { model: db.Conversation, where: { externalId: conversationId } }
    ],
    order: [['conversationIndex', 'DESC']],
    where,
    limit
  }

  if (returnCount) {
    return db.Message.count(queryOpts)
  }

  const messages = await db.Message.findAll(queryOpts)

  return (messages || []).map(m => {
    return {
      conversationIndex: m.conversationIndex,
      address: m.ethAddress,
      content: m.data.content,
      ext: m.data.ext,
      signature: m.signature,
      isKeys: m.isKeys,
      timestamp: m.createdAt,
      read: m.read
    }
  })
}

// Get all messages of type 'key' in a room/conversation
app.get('/messages/:conversationId/keys', async (req, res) => {
  const messages = await getMessages({
    conversationId: req.params.conversationId,
    isKeys: true
  })

  if (!messages.length) {
    return res.status(204).send([])
  }

  res.status(200).send(messages)
})

// Get count of all messages in a room/conversation
app.get('/messages/:conversationId/count', async (req, res) => {
  const messageCount = await getMessages({
    conversationId: req.params.conversationId,
    ...req.query,
    isKeys: false,
    returnCount: true
  })

  return res.status(200).send({
    messageCount
  })
})

// Get all messages in a room/conversation
app.get('/messages/:conversationId', async (req, res) => {
  const messages = await getMessages({
    conversationId: req.params.conversationId,
    ...req.query,
    isKeys: false
  })

  if (!messages.length) {
    return res.status(204).send([])
  }

  res.status(200).send(messages)
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
  if (
    (await isContract(conv_addresses[0])) ||
    (await isContract(conv_addresses[1]))
  ) {
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
    if (conversationIndex !== 0) {
      return res.status(409).end()
    } else if (content.type !== 'keys') {
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
          isKeys: true,
          read: true
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
          isKeys: content.type === 'keys',
          read: content.type !== 'msg' // Mark `events` and `keys` as read by default
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
          type: 'NEW_MESSAGE',
          content,
          timestamp: message.createdAt,
          conversationIndex,
          conversationId
        })
      )
    }

    // Send to notifications server
    // e.g. http://localhost:3456/messages
    if (config.NOTIFICATIONS_ENDPOINT_URL && content.type != 'keys') {
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

// Subscribe to marketplace events
function subscribeToMarketplaceEvents() {
  logger.debug('Subscribing to Marketplace events...')
  const redis_sub = redis.duplicate()
  redis_sub.subscribe('MESSAGING:MARKETPLACE_EVENT')

  redis_sub.on('message', async (channel, message) => {
    try {
      const { eventData, sender } = JSON.parse(message)
      const { seller, buyer } = eventData

      const content = {
        type: 'event',
        eventData,
        sender
      }

      const contentHash = Web3.utils.sha3(JSON.stringify(content))

      const externalId = [
        Web3.utils.toChecksumAddress(seller),
        Web3.utils.toChecksumAddress(buyer)
      ]
        .sort()
        .join('-')

      let conversation = await db.Conversation.findOne({
        where: { externalId }
      })

      let newMessageIndex = 0

      let newMessage

      if (!conversation) {
        // Seller and buyer haven't interacted yet
        // Create a conversation now and let them generate keys later
        newMessage = await db.sequelize.transaction(async t => {
          conversation = await db.Conversation.create(
            { externalId, messageCount: 1 },
            { transaction: t }
          )

          for (const converser of Array.from(new Set([buyer, seller, sender]))) {
            await db.Conversee.create(
              { conversationId: conversation.id, ethAddress: converser },
              { transaction: t }
            )
          }

          return await db.Message.create(
            {
              conversationId: conversation.id,
              conversationIndex: 0,
              ethAddress: sender,
              data: { content },
              contentHash,
              signature: null,
              isKeys: false,
              read: true
            },
            { transaction: t }
          )
        })
        logger.info(`Created conversation room ${externalId}`)
      } else {
        newMessageIndex = conversation.messageCount
        newMessage = await db.sequelize.transaction(async t => {
          conversation.update({
            messageCount: newMessageIndex + 1
          })

          return await db.Message.create(
            {
              conversationId: conversation.id,
              conversationIndex: newMessageIndex,
              ethAddress: sender,
              data: { content },
              contentHash,
              signature: null,
              isKeys: false,
              read: true
            },
            { transaction: t }
          )
        })
      }

      // Publish messages to be consumed by the websocket(below)
      for (const notify_address of [seller, buyer]) {
        // Push to redis
        await redis.publish(
          notify_address,
          JSON.stringify({
            type: 'MARKETPLACE_EVENT',
            content,
            timestamp: newMessage.createdAt,
            newMessageIndex,
            conversationId: externalId
          })
        )
      }
      logger.info(
        `Inserted '${eventData.eventType}' event to ${externalId} at ${newMessageIndex}`
      )
    } catch (err) {
      // TODO: Should we try if it failed because of duplicate conversationIndex?
      logger.error('Cannot process marketplace event', message, err)
    }
  })
}

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
  subscribeToMarketplaceEvents()
})
