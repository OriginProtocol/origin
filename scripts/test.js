const { spawn } = require('child_process')
const startGanache = require('./start-ganache')
const deployContracts = require('./deploy-contracts')
const testContracts = require('./test-contracts')
const testJavascript = require('./test-javascript')

async function start() {
  try {
    await startGanache()
    await testContracts()
    await deployContracts()
    await testJavascript()
    console.log('All tests successful. :)')
    process.exit()
  }
  catch(error) {
    console.log('Some tests failed. :(')
    process.exit()
  }
}

start()
