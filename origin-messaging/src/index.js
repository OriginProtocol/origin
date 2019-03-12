'use strict'

import '@babel/polyfill'
import bodyParser from 'body-parser'
import express from 'express'
import expressWs from 'express-ws'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import Web3 from 'web3'
import db from './models'
import logger from './logger'

import { verifyNewMessageSignature } from './verify'

import * as config from './config'

import _redis from 'redis'


const redis = _redis.createClient(process.env.REDIS_URL)

//the OrbitDB should be the message one
const messagingRoomsMap = {}
const snapshotBatchSize = config.SNAPSHOT_BATCH_SIZE

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

app.get('/accounts/:address', async (req, res) => {
  let { address } = req.params

  if (!Web3.utils.isAddress(address)) {
    res.statusMessage = 'Address is not a valid Ethereum address'

    return res.status(400).end()
  }

  address = Web3.utils.toChecksumAddress(address)

  const entry = await db.Registry.findOne({where:{ethAddress:address}})

  if (!entry) {
    return res.status(204).end()
  }

  res.status(200).send(entry.data)
})

app.post('/accounts/:address', async (req, res) => {
  let { address } = req.params

  if (!Web3.utils.isAddress(address)) {
    res.statusMessage = 'Address is not a valid Ethereum address'

    return res.status(400).end()
  }

  address = Web3.utils.toChecksumAddress(address)

  const { signature, data } = req.body

  if (
    verifyRegistrySignature(signature, '', {
      payload: { value: data, key: address }
    })
  ) {
    const entry = await db.Registry.findOne({where:{ethAddress:address}})
    console.log('setting registry existing entry:', entry)
    if (!entry || entry.signature != signature) {
      await db.Registry.upsert({ethAddress:address, data, signature})
    }
    return res.status(200).send(address)
  }
  res.statusMessage = 'Cannot verify signature of registery'
  return res.status(400).end()
})

app.get('/conversations/:address', async (req, res) => {
  let { address } = req.params

  if (!Web3.utils.isAddress(address)) {
    res.statusMessage = 'Address is not a valid Ethereum address'

    return res.status(400).end()
  }

  address = Web3.utils.toChecksumAddress(address)

  const convs = await db.Conversee.findAll({where:{ethAddress:address}, include:[{ model:db.Conversation }]})

  if (!convs) {
    return res.status(204).end()
  }

  res.status(200).send(convs.map(c => { return { id:c.Conversation.externalId, count:c.Conversation.messageCount } } ))
})

app.get('/messages/:conversationId', async (req, res) => {
  let { conversationId } = req.params

  const messages = await db.Message.findAll({include:[{ model:db.Conversation, where:{ externalId:conversationId } }]})

  if (!messages) {
    return res.status(204).end()
  }

  res.status(200).send(messages.map(m => { return {
    index: m.converssationIndex,
    address: m.ethAddress,
    content: m.data.content,
    ext: m.data.ext,
    signature: m.signature,
    isKeys: m.isKeys
  } } ))
})

app.post('/messages/:conversationId/:conversationIndex', async (req, res) => {
  const { conversationId, messageIndex } = req.params
  const { signature, content, address } = req.body

  const entry = await db.Registry.findOne({where:{ethAddress:address}})

  if (!verifyNewMessageSignature(signature, converssationId, messageIndex, content, entry.data.address))
  {
    return res.status(401).send("Signature verification failed.")
  }

  const conv = await db.Conversation.findOne({ where:{ externalId: conversationId} })

  if (!conv)
  {
    const conversers = conversationId.split("-")
    //let's create a conversation...
    if (!conversers.includes(address))
    {
      return res.status(401).send("One of the conversers involved must initiate the conversation.")
    }
    if (messageIndex != 0)
    {
      return res.status(409).end()
    }
    else if (content.type != "keys")
    {
      return res.status(400).send("Conversations must be initiated by a keys exchange")
    }

    await db.sequelize.transaction( async (t) => {
      const conversation = await db.Conversation.create({externalId:conversationId, messageCount:1}, {transaction:t})
      for (const converser of conversers) {
        await db.Conversee.create({ conversationId: conversation.id, ethAddress:converser }, {transaction:t})
      }
      return db.Message.create({ conversationId: conversation.id, conversationIndex:conversationIndex, 
        ethAddress:address, data:{content}, signature, isKeys:true }, {transaction:t})
    })
  } else {
    const conversees = await db.Conversee.findAll({ where:{ conversationId:conv.id } })
    const conv_addresses = conversees.map( c => c.ethAddress )

    if ( !conv_addresses.includes(address) )
    {
      return res.status(401).send("Address not part of current conversation.")
    }

    //create a message that's the correct sequence
    await db.sequelize.transaction( async (t) => {
      const conversation = await db.Conversation.findOne({ where:{ externalId:externalId }, transaction: t, lock: t.LOCK.UPDATE })
      if (conversationIndex != conversation.messageCount) {
        res.status(409).send("Address not part of current conversation.")
        return false
      }
      await db.Message.create({ conversationId: conversation.id, conversationIndex:conversation.messageCount, 
        address:ethAddress, data:{content}, signature, isKeys:(content.type == "keys") }, {transaction:t})
      conversation.messageCount += 1
      return conversation.save({ transaction:t })
    } )
  }

  for (const notify_address of conv_addresses) {
    await redis.publish(notify_address, JSON.stringify({type:content.type, address, conversationIndex, conversationId}))
  }
  return res.status(200).send(1)
})


app.ws('/message-events/:address', (ws, req) => {
  const { address } = req.params
  const redis_sub = redis.duplicate()
  redis_sub.subscribe(address)

  const msg_handler = (channel, msg) => {
    ws.send(msg)
  }

  redis_sub.on('message', msg_handler)
  
  ws.on('close', () => {
    redis_sub.quit()
  }
})

app.listen(port, () => {
  logger.debug(`REST endpoint listening on port ${port}`)
})

