const { spawn } = require('child_process')
const Ganache = require('ganache-core')
const HttpIPFS = require('ipfs/src/http')
const ipfsAPI = require('ipfs-api')
const fs = require('fs')
const memdown = require('memdown')
const net = require('net')

const portInUse = port =>
  new Promise(function(resolve) {
    const srv = net
      .createServer()
      .once('error', () => resolve(true))
      .once('listening', () => srv.once('close', () => resolve(false)).close())
      .listen(port, '0.0.0.0')
  })

// import Web3 from 'web3'

// import simpleIssuer from './issuer-services/_simple'

// try {
//   var { simpleApp } = require('./issuer-services/config.json')
//   simpleIssuer(app, { web3: new Web3(), simpleApp })
// } catch(e) {
//   /* Ignore */
// }

const startGanache = (opts = {}) =>
  new Promise((resolve, reject) => {
    const ganacheOpts = {
      total_accounts: 5,
      default_balance_ether: 100,
      db_path: `${__dirname}/data/db`,
      network_id: 999,
      mnemonic:
        'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
      // blockTime: 3
    }
    if (opts.inMemory) {
      ganacheOpts.db = memdown()
    } else {
      try {
        fs.mkdirSync(`${__dirname}/data/db`)
      } catch (e) {
        /* Ignore */
      }
    }
    const server = Ganache.server(ganacheOpts)
    const port = 8545
    server.listen(port, err => {
      if (err) {
        return reject(err)
      }
      console.log(`Ganache listening on port ${port}.`)
      resolve(server)
    })
  })

const startIpfs = () =>
  new Promise((resolve, reject) => {
    const httpAPI = new HttpIPFS(`${__dirname}/data/ipfs`, {
      Addresses: {
        API: '/ip4/0.0.0.0/tcp/5002',
        Gateway: '/ip4/0.0.0.0/tcp/8080'
      },
      Bootstrap: []
    })
    console.log('Start IPFS')
    httpAPI.start(true, err => {
      if (err) {
        return reject(err)
      }
      console.log('Started IPFS')
      resolve(httpAPI)
    })
  })

const populateIpfs = () =>
  new Promise((resolve, reject) => {
    const ipfs = ipfsAPI('localhost', '5002', { protocol: 'http' })
    console.log('Populate IPFS:')
    ipfs.util.addFromFs(
      '../../origin-js/test/fixtures',
      { recursive: true },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        result.forEach(r => console.log(`  ${r.hash} ${r.path}`))
        resolve(result)
      }
    )
  })

const deployContracts = () =>
  new Promise((resolve, reject) => {
    const originContractsPath = '../../origin-contracts/'
    const truffleMigrate = spawn(
      `./node_modules/.bin/truffle`,
      ['migrate', '--reset'],
      {
        cwd: originContractsPath,
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

const started = {}

module.exports = async function start(opts = {}) {
  if (opts.ganache && !started.ganache) {
    const ganacheOpts = opts.ganache === true ? {} : opts.ganache
    if (await portInUse(8545)) {
      console.log('Ganache already started')
    } else {
      started.ganache = await startGanache(ganacheOpts)
    }
  }

  if (opts.deployContracts) {
    await deployContracts()
  }

  if (opts.ipfs && !started.ipfs) {
    if (await portInUse(5002)) {
      console.log('IPFS already started')
    } else {
      started.ipfs = await startIpfs()
    }
    if (opts.populate && !started.populate) {
      started.populate = true
      await populateIpfs()
    }
  }

  return async function shutdown() {
    if (started.ganache) {
      await started.ganache.close()
    }
    if (started.ipfs) {
      await new Promise(resolve => started.ipfs.stop(() => resolve()))
    }
  }
}
