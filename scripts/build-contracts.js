const { spawn } = require('child_process')

const buildContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleCompile = spawn('../node_modules/.bin/truffle', ['compile'], { cwd: './contracts' })
    truffleCompile.stdout.pipe(process.stdout)
    truffleCompile.stderr.pipe(process.stderr)

    truffleCompile.on('exit', code => {
      if (code !== 0) {
        return reject()
      }
      console.log('Truffle compile finished OK.')
      resolve()
    })
  })
}

module.exports = buildContracts
