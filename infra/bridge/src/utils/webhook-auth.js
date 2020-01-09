const webhookAuthMiddleware = (req, res, next) => {
  if (req.headers.authorization !== process.env.WEBHOOK_ADMIN_SECRET) {
    res.status(401).send({
      error: 'Authentication required'
    })
    return
  }

  next()
}

module.exports = webhookAuthMiddleware
