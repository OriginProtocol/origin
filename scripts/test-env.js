/**
 * Start a long-running test environment.
 * Useful when running mocha tests in watch mode
 */

const startGanache = require('./helpers/start-ganache')
const deployContracts = require('./helpers/deploy-contracts')
const startIpfs = require('./helpers/start-ipfs')

const start = async () => {
  try {
    await startGanache()
    await deployContracts()
    await startIpfs()
  }
  catch(error) {
    console.error(`Env failed.\n\n${error}`)
  }
}

start()
