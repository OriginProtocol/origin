import redis from 'redis'

const SIZE_PREFIX = "size."
const PUBSUB_PREFIX = "ps."


//
// create an expiring message queue
//
class MessageQueue {
  constructor({queueTimeout=24 * 3600} = {}) {
    // TODO: pass config in here, for now connect to local client
    this.redis = redis.createClient()
    this.redis_sub = this.redis.duplicate()
    this.queueTimeout = queueTimeout
  }

  async addMessage(queueKey, message) {
    return new Promise((resolve, reject) => {
      const pubsubQueueKey = PUBSUB_PREFIX + queueKey
      const sizeQueueKey = SIZE_PREFIX + queueKey
      const timestamp = (new Date()).getTime()
  
      //two steps, increment the message
      this.redis.multi()
        .incr(sizeQueueKey)
        .expire(sizeQueueKey, this.queueTimeout)
        .exec(async (err, replies) => {
          if(err) {
            reject(err)
          } else {
            const msgId = replies[0]
            if (typeof messageId == 'number')
            {
              this.redis.multi()
                .zadd(queueKey, timestamp, JSON.stringify({msgId, timestamp, message}))
                .expire(queueKey, this.queueTimeout)
                .expire(sizeQueueKey, this.queueTimeout)
                .publish(pubsubQueueKey, messageId) // new message is here
                .exec((err, replies) => {
                  if(err){
                    reject(err)
                  } else {
                    await this.purgeOldMessages(pubsubQueueKey)
                    resolve(replies)
                  }
                })
            }
            else
            {
              reject('INCR result not a number')
            }
          }
        })
    })
  }

  async getMessages(queueKey, lastReadTimestamp) {
    return new Promise((resolve, reject) => {
      this.redis.zrangebyscore(queueKey,  '(' + lastTimestamp, '+inf', 'WITHSCORES', (err, result) => { 
        if (err) {
          reject(err)
        } else {
          resolve(
            result.reduceRight( (acc, a) => { 
              (!acc.length || acc[0].msg) ? acc.unshift({msgId:Number(a)}) : acc[0].msg = a 
              return acc
            }, []) )
        }
      })
    })
  }

  async purgeOldMessages(queueKey) {
    //purgeOldMessages in case we go a little too crazy
    const timestamp = (new Date()).getTime() - (this.queueTimeout * 1000)
    return new Promise((resolve, reject) => {
      this.redis.zremrangebyscore(queueKey, 0, timestamp, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }


  //
  // cb must be function(message)
  // returns cleanup function
  //
  subscribeMessage(queueKey, cb) {
    const events = this.redis_sub
    const pubsubQueueKey = PUBSUB_PREFIX + queueKey
    events.subscribe(pubsubQueueKey)

    const messageHandler = (channel, message) => {
        if(channel == pubsubQueueKey)
        {
          cb(message)
        }
      }
    events.on("message", messageHandler)
    return () => events.removeListener('message', messageHandler)
  }
}

export default MessageQueue
