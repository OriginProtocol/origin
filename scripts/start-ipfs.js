const { spawn } = require('child_process')

const startIpfs = () => {
  return new Promise((resolve, reject) => {
    const daemon = spawn('./node_modules/.bin/jsipfs', ['daemon', '--init'])
    daemon.stdout.pipe(process.stdout)
    daemon.stderr.on('data', data => {
      reject(String(data))
    })
    daemon.stdout.on('data', data => {
      if (String(data).includes('Daemon is ready')) {
        resolve(daemon)
      }
    })
  })
}

module.exports = startIpfs
