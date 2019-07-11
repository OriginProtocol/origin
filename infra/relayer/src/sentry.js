const Sentry = require('@sentry/node')
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NAMESPACE || 'development'
})
module.exports = Sentry
