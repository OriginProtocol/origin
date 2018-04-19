const startGanache = require('./start-ganache')
const deployContracts = require('./deploy-contracts')
const testContracts = require('./test-contracts')
const startIpfs = require('./start-ipfs')
const testJavascript = require('./test-javascript')

const start = async () => {
  try {
    await startGanache()
    await deployContracts()
    await testContracts()
    let daemon = await startIpfs()
    await testJavascript()
    console.log('All tests successful. :)')
    daemon.kill() // otherwise this process will keep running in the background
    process.exit()
  }
  catch(error) {
    console.log('Some tests failed. :(')
    process.exit()
  }
}

start()
