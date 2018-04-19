const { spawn } = require('child_process')

const testContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleTest = spawn('../node_modules/.bin/truffle', ['test'], { cwd: './contracts' })
    truffleTest.stdout.pipe(process.stdout)
    truffleTest.stderr.on('data', data => {
      reject(String(data))
    })
    truffleTest.on('exit', code => {
      resolve()
    })
  })
}

module.exports = testContracts
