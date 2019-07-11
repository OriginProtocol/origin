const Sentry = require('@sentry/node')
Sentry.init({ dsn: process.env.SENTRY_DSN })
module.exports = Sentry
