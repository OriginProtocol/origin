const { spawn } = require('child_process')
const Ganache = require('ganache-core')
const HttpIPFS = require('ipfs/src/http')
const ipfsAPI = require('ipfs-api')
const fs = require('fs')
const memdown = require('memdown')
const net = require('net')
const path = require('path')

const portInUse = port =>
  new Promise(function(resolve) {
    const srv = net
      .createServer()
      .once('error', () => resolve(true))
      .once('listening', () => srv.once('close', () => resolve(false)).close())
      .listen(port, '0.0.0.0')
  })

const startGanache = (opts = {}) =>
  new Promise((resolve, reject) => {
    const ganacheOpts = {
      total_accounts: opts.total_accounts || 5,
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

const populateIpfs = ({ logFiles } = {}) =>
  new Promise((resolve, reject) => {
    const ipfs = ipfsAPI('localhost', '5002', { protocol: 'http' })
    console.log('Populating IPFS...')
    ipfs.util.addFromFs(
      path.resolve(__dirname, '../origin-js/test/fixtures'),
      { recursive: true },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        if (logFiles) {
          result.forEach(r => console.log(`  ${r.hash} ${r.path}`))
        }
        console.log(`Populated IPFS with ${result.length} files.`)
        resolve(result)
      }
    )
  })

function writeTruffleAddress(contract, network, address) {
  const filename = `${__dirname}/../contracts/build/contracts/${contract}.json`
  const rawContract = fs.readFileSync(filename)
  const Contract = JSON.parse(rawContract)
  try {
    Contract.networks[network].address = address
    fs.writeFileSync(filename, JSON.stringify(Contract, null, 4))
  } catch (error) {
    // Didn't copy contract build files into the build directory?
    console.log('Could not write contract address to truffle file')
  }
}

const contractsPath = `${__dirname}/../contracts/build`
const writeTruffle = () =>
  new Promise(resolve => {
    console.log('Writing truffle...')
    try {
      const rawAddresses = fs.readFileSync(contractsPath + '/contracts.json')
      const addresses = JSON.parse(rawAddresses)
      if (addresses.Marketplace) {
        writeTruffleAddress('V00_Marketplace', '999', addresses.Marketplace)
      }
      if (addresses.IdentityEvents) {
        writeTruffleAddress('IdentityEvents', '999', addresses.IdentityEvents)
      }
      if (addresses.OGN) {
        writeTruffleAddress('OriginToken', '999', addresses.OGN)
      }
    } catch (e) {
      console.log(e)
    }
    resolve()
  })

const deployContracts = ({ skipIfExists, filename = 'contracts' }) =>
  new Promise((resolve, reject) => {
    const filePath = `${contractsPath}/${filename}.json`
    if (skipIfExists && fs.existsSync(filePath)) {
      try {
        const c = JSON.parse(fs.readFileSync(filePath))
        if (Object.keys(c).length) return resolve()
      } catch (e) {
        /* Regenerate file */
      }
    }
    const originContractsPath = path.resolve(__dirname, '../graphql')
    const startServer = spawn(
      `node`,
      ['-r', '@babel/register', 'fixtures/populate-server.js', filename],
      {
        cwd: originContractsPath,
        stdio: 'inherit',
        env: process.env
      }
    )
    startServer.on('exit', code => {
      if (code === 0) {
        console.log('Deploying contracts finished OK.')
        resolve()
      } else {
        reject('Deploying contracts failed.')
        reject()
      }
    })
  })

const started = {}
let extrasResult

module.exports = async function start(opts = {}) {
  if (opts.ganache && !started.ganache) {
    const ganacheOpts = opts.ganache === true ? {} : opts.ganache
    if (await portInUse(8545)) {
      console.log('Ganache already started')
    } else {
      started.ganache = await startGanache(ganacheOpts)
    }
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

  if (opts.deployContracts && !started.contracts) {
    if (!fs.existsSync(`${contractsPath}/contracts.json`)) {
      fs.writeFileSync(`${contractsPath}/contracts.json`, '{}')
    }
    if (!fs.existsSync(`${contractsPath}/tests.json`)) {
      fs.writeFileSync(`${contractsPath}/tests.json`, '{}')
    }
    await deployContracts({
      skipIfExists: opts.skipContractsIfExists,
      filename: opts.contractsFile
    })
    started.contracts = true
  }

  if (opts.writeTruffle) {
    await writeTruffle()
  }

  if (opts.extras && !started.extras) {
    extrasResult = await opts.extras()
    started.extras = true
  }

  const shutdownFn = async function shutdown() {
    if (started.ganache) {
      await started.ganache.close()
    }
    if (started.ipfs) {
      await new Promise(resolve => started.ipfs.stop(() => resolve()))
    }
  }

  shutdownFn.extrasResult = extrasResult

  return shutdownFn
}
