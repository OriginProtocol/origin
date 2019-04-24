const { InMemoryBackend } = require('./InMemoryBackend')
const { IndexedDBBackend } = require('./IndexedDBBackend')
const { PostgreSQLBackend } = require('./PostgreSQLBackend')

module.exports = {
  InMemoryBackend,
  IndexedDBBackend,
  PostgreSQLBackend
}
