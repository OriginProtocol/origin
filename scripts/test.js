const startGanache = require('./start-ganache')
const deployContracts = require('./deploy-contracts')
const testContracts = require('./test-contracts')
const startIpfs = require('./start-ipfs')
const testJavascript = require('./test-javascript')
const testFormat = require('./test-format')

const start = async () => {
  let daemon
  try {
    await startGanache()
    await deployContracts()
    await testContracts()
    daemon = await startIpfs()
    await testJavascript()
    await testFormat()
    console.log('Tests passed. :)')
    daemon.kill()
    process.exit()
  }
  catch(error) {
    console.error(`Tests failed.\n\n${error}`)
    if (daemon) {
      daemon.kill()
    }
    process.exit(1)
  }
}

start()
