require('./app')
if (process.env.LISTENER !== 'false') {
  const start = require('./listener')
  start()
}
