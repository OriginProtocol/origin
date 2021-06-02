const { RateLimiterMemory } = require('rate-limiter-flexible')

const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60 // per 60 seconds per IP
})

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next()
    })
    .catch(() => {
      res.status(429).send('Too Many Requests')
    })
}

module.exports = rateLimiterMiddleware
