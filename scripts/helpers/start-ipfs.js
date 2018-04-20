const { spawn } = require('child_process')

const ipfsInit = () => {
  return new Promise((resolve, reject) => {
    const init = spawn('./node_modules/.bin/jsipfs', ['init'])
    init.on('exit', code => {
      // we don't care whether it succeeded or failed.
      // We're having issues running daemon with the --init flag, so we're just trying to init here; if it fails that means it's already been initialized. It's a hack but it works.
      resolve()
    })
  })
}

const ipfsDaemon = () => {
  return new Promise((resolve, reject) => {
    const daemon = spawn('./node_modules/.bin/jsipfs', ['daemon'])
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

const startIpfs = () => {
  return ipfsInit()
  .then(() => {
    return ipfsDaemon()
  })
}

module.exports = startIpfs
