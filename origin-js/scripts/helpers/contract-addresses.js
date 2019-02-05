const { spawn } = require('child_process')

/**
 * Return a JS object of contract names and their deployed addresses
 * @return {Object} JS object of {name: address}
 */
const truffleContractAddresses = () => {
  return new Promise((resolve, reject) => {
    const truffleOutRegex = /(\w+): (0x[A-Fa-f0-9]{40})/
    const contracts = {}
    const truffleNetworks = spawn(
      'truffle',
      ['networks'],
      {
        cwd: '../origin-contracts',
        env: process.env
      }
    )
    truffleNetworks.stdout.on('data', (data) => {
      if (data) {
        const dataArr = data.toString().split('\n')
        dataArr.map(ln => {
          ln = ln.trim()
          const match = ln.match(truffleOutRegex)
          if (match) {
            contracts[match[1]] = match[2]
          }
        })
      }
    })
    truffleNetworks.on('exit', code => {
      if (code === 0) {
        resolve(contracts)
      } else {
        reject(null)
        reject()
      }
    })
  })
}

module.exports = truffleContractAddresses
