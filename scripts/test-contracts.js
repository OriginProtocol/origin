const { spawn } = require('child_process')

const testContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleTest = spawn('../node_modules/.bin/truffle', ['test'], { cwd: './contracts' })
    truffleTest.stdout.pipe(process.stdout)
    truffleTest.stderr.pipe(process.stderr)

    truffleTest.on('exit', code => {
      if (code !== 0) {
        return reject()
      }
      resolve()
    })
  })
}

module.exports = testContracts
