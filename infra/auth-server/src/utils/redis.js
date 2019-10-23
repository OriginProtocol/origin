const redis = require('redis')
const { promisify } = require('util')

const redisClient = redis.createClient(process.env.REDIS_URL)
// getAsync for redis get
const getAsync = promisify(redisClient.get).bind(redisClient)
const getbitAsync = promisify(redisClient.getbit).bind(redisClient)
const setbitAsync = promisify(redisClient.setbit).bind(redisClient)

module.exports = {
  redisClient,
  getAsync,
  getbitAsync,
  setbitAsync
}
