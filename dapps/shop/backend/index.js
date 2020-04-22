require('./app')
if (process.env.LISTENER !== 'false') {
  require('./listener')
}
