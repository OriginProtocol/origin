const { exec } = require('child_process')

const deployContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleMigrate = exec(
      'cd node_modules/origin-contracts && ./node_modules/.bin/truffle migrate --reset'
    )
    truffleMigrate.stdout.pipe(process.stdout)
    truffleMigrate.stderr.on('data', data => {
      reject(String(data))
    })
    truffleMigrate.on('exit', code => {
      if (code === 0) {
        console.log('Truffle migrate finished OK.')
        resolve()
      } else {
        reject('Truffle migrate failed.')
      }
    })
  })
}

module.exports = deployContracts
