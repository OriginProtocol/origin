const { spawn } = require('child_process')

const buildContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleCompile = spawn('../node_modules/.bin/truffle', ['compile'], { cwd: './contracts' })
    truffleCompile.stdout.pipe(process.stdout)
    truffleCompile.stderr.on('data', data => {
      reject(String(data))
    })
    truffleCompile.on('exit', code => {
      if (code === 0) {
        console.log('Truffle compile finished OK.')
      }
      resolve()
    })
  })
}

module.exports = buildContracts
