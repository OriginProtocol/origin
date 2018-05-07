const startGanache = require('./helpers/start-ganache')
const deployContracts = require('./helpers/deploy-contracts')
const testContracts = require('./helpers/test-contracts')
const startIpfs = require('./helpers/start-ipfs')
const testJavascript = require('./helpers/test-javascript')
const testFormat = require('./helpers/test-format')

const start = async () => {
  try {
    await startGanache()
    await deployContracts()
    await testContracts()
    await startIpfs()
    await testJavascript()
    await testFormat()
    console.log('Tests passed. :)')
    process.exit()
  }
  catch(error) {
    console.error(`Tests failed.\n\n${error}`)
    process.exit(1)
  }
}

start()
