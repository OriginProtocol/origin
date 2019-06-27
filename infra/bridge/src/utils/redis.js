const redis = require('redis')
const { promisify } = require('util')

const redisClient = redis.createClient(process.env.REDIS_URL)
// getAsync for redis get
const getAsync = promisify(redisClient.get).bind(redisClient)

module.exports = {
  redisClient,
  getAsync
}
