const startGanache = require('./helpers/start-ganache')
const testContracts = require('./helpers/test-contracts')
const buildContracts = require('./helpers/build-contracts')
const startIpfs = require('./helpers/start-ipfs')
const watch = require('node-watch')

// Simple enqueueing system to prevent interrupting a test. Rerunning in the middle of a test causes issues.
let isRunning = false
let isEnqueued = false
const runTests = async () => {
  if (!isRunning) {
    isRunning = true
    await buildContracts()
    await testContracts()
    isRunning = false
    if (isEnqueued) {
      isEnqueued = false
      runTests()
    }
  } else {
    isEnqueued = true
  }
}

const start = async () => {
  await startGanache()
  await startIpfs()

  runTests()

  // watch contracts
  watch(['./contracts/contracts', './contracts/test'], { recursive: true }, async (evt, name) => {
    console.log('%s changed.', name)
    runTests()
  })
}

start()
