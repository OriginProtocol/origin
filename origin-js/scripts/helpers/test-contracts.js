const { spawn } = require('child_process')

// When run with no arguments, this script runs all contract tests. It
// optionally takes a single argument that specifies the path of a single
// contract test to run. That path is relative to 'contracts/test'.
const testContracts = () => {
  return new Promise((resolve, reject) => {
    const args = [
      '-r',
      'babel-register',
      '-r',
      'babel-polyfill',
      '-t',
      '10000',
      '--exit',
      'contracts/test-alt/'
    ]
    const contractTest = spawn('./node_modules/.bin/mocha', args)
    contractTest.stdout.pipe(process.stdout)
    contractTest.stderr.on('data', data => {
      reject(String(data))
    })
    contractTest.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject('Contract tests failed')
      }
    })
  })
}

module.exports = testContracts
