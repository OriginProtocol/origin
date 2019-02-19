/**
 * This file should be run before all other tests, which can be done by passing
 * the --file option to mocha. It sets up and tears down the infrastructure
 * (ethereum test node and IPFS) required to run tests.
 */

import client from '../src/index'
import services from 'origin-services'
import { setNetwork } from '../src/contracts'

const isWatchMode = process.argv.some(arg => arg === '-w' || arg === '--watch')
let shutdown

before(async function() {
  // Start Ganache (in-memory) and IPFS
  shutdown = await services({ ganache: { inMemory: true }, ipfs: true })
  setNetwork('test')

  // Disable GraphQL response caching
  client.defaultOptions = {
    watchQuery: { fetchPolicy: 'network-only' },
    query: { fetchPolicy: 'network-only' }
  }
})

// Override exit code to prevent error when using Ctrl-c after `npm run test:watch`
if (isWatchMode) {
  process.once('exit', () => process.exit(0))
} else {
  // Shutdown ganache etc if we're not in watch mode and tests are finished.
  after(() => shutdown())
}
