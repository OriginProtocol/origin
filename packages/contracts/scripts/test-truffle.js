const { spawn } = require('child_process')

// When run with no arguments, this script runs all contract tests. It
// optionally takes a single argument that specifies the path of a single
// contract test to run. That path is relative to 'contracts/test'.
const testContracts = () => {
  return new Promise((resolve, reject) => {
    const testFile = process.argv[2]
    let truffleArgs
    if (testFile === undefined) {
      truffleArgs = ['test', '--compile-all']
    } else {
      console.log('running ' + testFile)
      truffleArgs = ['test', 'test/' + testFile, '--compile-all']
    }
    const truffleTest = spawn('./node_modules/.bin/truffle', truffleArgs)
    truffleTest.stdout.pipe(process.stdout)
    truffleTest.stderr.on('data', data => {
      reject(String(data))
    })
    truffleTest.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject('Truffle contract tests failed')
      }
    })
  })
}

module.exports = testContracts
