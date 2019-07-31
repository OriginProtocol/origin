/**
 * This file should be run before all other tests, which can be done by passing
 * the --file option to mocha. It sets up and tears down the infrastructure
 * (ethereum + IPFS) required to run tests.
 */
const services = require('@origin/services')

let shutdownServices

async function _startServices() {
  return await services({
    ganache: { inMemory: true },
    ipfs: true, // Needed by the graphql populate script that is also used for deploying contracts.
    deployContracts: true,
    contractsFile: 'tests'
  })
}

before(async function() {
  this.timeout(60000)

  console.log('Starting services...')
  shutdownServices = await _startServices()
})

after(async function() {
  if (shutdownServices) {
    console.log('Shutting down services...')
    await shutdownServices()
  }
})

