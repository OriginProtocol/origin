const startGanache = require('./start-ganache')
const testContracts = require('./test-contracts')
const watch = require('node-watch')

// Simple enqueueing system to prevent interrupting a test. Rerunning in the middle of a test causes issues.
let isRunning = false
let isEnqueued = false
const runTests = async () => {
  if (!isRunning) {
    isRunning = true
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

  runTests()

  // watch contracts
  watch('./contracts/contracts', { recursive: true }, async (evt, name) => {
    console.log('%s changed.', name)
    runTests()
  })
}

start()
