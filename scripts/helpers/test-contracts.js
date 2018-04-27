const { spawn } = require('child_process')

const testContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleTest = spawn('../node_modules/.bin/truffle', ['test', '--compile-all'], { cwd: './contracts' })
    truffleTest.stdout.pipe(process.stdout)
    truffleTest.stderr.on('data', data => {
      reject(String(data))
    })
    truffleTest.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject('Contract tests failed')
      }
    })
  })
}

module.exports = testContracts
