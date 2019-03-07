'use strict'

import redis from 'redis-mock'
import MessageQueue from '../src/utils/message-queue'
import chai from 'chai'
const expect = chai.expect

// patch in publish as part of multi this has been tested to work
redis.Multi.prototype.publish = function() {
  this._command('publish_multi', Array.prototype.slice.call(arguments))
  return this
}
redis.RedisClient.prototype.publish_multi = function(key, message, cb) {
  this._client.publish(key, message)
  cb(null, '1')
}

const maxQueueSize = 5
const numMessages = 10
const testKey = 'test_key'
const messagePrefix = 'Message number: '

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('Message Queue', () => {
  let mqueue
  let sub_read_count = 0
  let first_message = null
  let last_message = null

  before(async () => {
    //new redis queue with mocked redis
    mqueue = new MessageQueue({ redis: redis, maxQueueSize })
    let lastRead = 0

    const dreq = mqueue.subscribeMessage(testKey, async msgId => {
      if (lastRead < msgId) {
        const msg_array = await mqueue.getMessages(testKey, lastRead)
        if (msg_array.length) {
          lastRead = msg_array[msg_array.length - 1].msgId
          last_message = msg_array[msg_array.length - 1].msg
          if (!first_message) {
            first_message = msg_array[msg_array.length - 1].msg
          }
          sub_read_count += 1
        }
      }
    })

    await mqueue.addMessage(testKey, 'first')
    for (const i of Array(numMessages).keys()) {
      const msg = messagePrefix + i
      await sleep(1)
      await mqueue.addMessage(testKey, msg)
    }
    await sleep(1)
    await mqueue.addMessage(testKey, 'last')
  })

  describe('#subscribeMessages()', () => {
    it('it should have read all message(including first and last)!', done => {
      expect(sub_read_count).to.equal(numMessages + 2)
      done()
    })
    it('it should have seen first message!', done => {
      expect(first_message).to.equal('first')
      expect(last_message).to.equal('last')
      done()
    })
  })

  describe('#getMessages()', () => {
    it('messages count should be at max + 1', async () => {
      const msg_count = await mqueue.getMessageCount(testKey)
      expect(msg_count).to.equal(maxQueueSize + 1)
    })

    it('number of messages should be at max + 1 ', async () => {
      const messages = await mqueue.getMessages(testKey, 0)
      expect(messages.length).to.equal(maxQueueSize + 1)
    })

    it('can get a section of messages', async () => {
      const messages = await mqueue.getMessages(testKey, 0)
      const section_messages = await mqueue.getMessages(
        testKey,
        messages[2].msgId
      )
      expect(section_messages.length).to.equal(messages.length - (2 + 1))
    })
  })

  describe('#getIndexMessage()', () => {
    it('last message is last', async () => {
      const last = await mqueue.getLastMessage(testKey)
      expect(last.msg).to.equal('last')
    })
    it('first message number of messages - max', async () => {
      const first = await mqueue.getFirstMessage(testKey)
      const middle_id = numMessages - maxQueueSize
      expect(first.msg).to.equal(messagePrefix + middle_id)
    })
  })
})
