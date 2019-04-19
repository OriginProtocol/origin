/**
 * This file should be run before all other tests, which can be done by passing
 * the --file option to mocha. It sets up and tears down the infrastructure
 * (ethereum test node and IPFS) required to run tests.
 */

import services from '@origin/services'

const isWatchMode = process.argv.some(arg => arg === '-w' || arg === '--watch')
let shutdown

before(async function() {
  this.timeout(30000)
  // Start Ganache (in-memory) and IPFS
  shutdown = await services({ ganache: { inMemory: true, total_accounts: 20 }, ipfs: true, deployContracts: true })
})

// Override exit code to prevent error when using Ctrl-c after `npm run test:watch`
if (isWatchMode) {
  process.once('exit', () => process.exit(0))
} else {
  // Shutdown ganache etc if we're not in watch mode and tests are finished.
  after(async function() {
    await shutdown()
  })
}
