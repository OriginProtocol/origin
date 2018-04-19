const { spawn } = require('child_process')

const deployContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleMigrate = spawn('../node_modules/.bin/truffle', ['migrate', '--reset', '--compile-all'], { cwd: './contracts' })
    truffleMigrate.stdout.pipe(process.stdout)
    truffleMigrate.stderr.on('data', data => {
      reject(String(data))
    })
    truffleMigrate.on('exit', code => {
      if (code === 0) {
        console.log('Truffle migrate finished OK.')
      }
      resolve()
    })
  })
}

module.exports = deployContracts
