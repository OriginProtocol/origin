const startGanache = require('./helpers/start-ganache')
const deployContracts = require('./helpers/deploy-contracts')
const testContracts = require('./helpers/test-contracts')
const startIpfs = require('./helpers/start-ipfs')
const testJavascript = require('./helpers/test-javascript')
const testFormat = require('./helpers/test-format')

const start = async () => {
  try {
    await testFormat()
    await startGanache()
    await testContracts()
    await deployContracts()
    await startIpfs()
    await testJavascript()
    console.log('Tests passed. :)')
    process.exit()
  }
  catch(error) {
    console.error(`Tests failed.\n\n${error}`)
    process.exit(1)
  }
}

start()
