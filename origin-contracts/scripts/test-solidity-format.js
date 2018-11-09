const { spawn } = require('child_process')

const testSolidityFormat = () => {
  return new Promise((resolve, reject) => {
    const solium = spawn('./node_modules/.bin/solium', [
      '-d',
      'contracts/'
    ])
    solium.stdout.pipe(process.stdout)
    solium.on('exit', code => {
      if (code === 0) {
        console.log('Solidity formatter inspection passed.')
      } else {
        reject(`Solidity formatter inspection failed.`)
      }
      resolve()
    })
  })
}

module.exports = testSolidityFormat
