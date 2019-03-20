const { spawn } = require('child_process')

// When run with no arguments, this script runs all contract tests. It
// optionally takes a single argument that specifies the path of a single
// contract test to run. That path is relative to 'contracts/test'.
const testContracts = () => {
  return new Promise((resolve, reject) => {
    const args = [
      '-r',
      '@babel/register',
      '-t',
      '20000',
      '--exit',
      'test-alt'
    ]
    const contractTest = spawn('./node_modules/.bin/mocha', args, {
      stdio: 'inherit',
      env: process.env
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
