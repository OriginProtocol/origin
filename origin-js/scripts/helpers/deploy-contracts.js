const { spawn } = require('child_process')

const deployContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleMigrate = spawn(
      './node_modules/.bin/truffle',
      ['migrate', '--reset'],
      {
        cwd: 'node_modules/origin-contracts',
        stdio: 'inherit',
        env: process.env
      }
    )
    truffleMigrate.on('exit', code => {
      if (code === 0) {
        console.log('Truffle migrate finished OK.')
        resolve()
      } else {
        reject('Truffle migrate failed.')
        reject()
      }
    })
  })
}

module.exports = deployContracts
