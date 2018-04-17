const spawn = require('child_process').spawn
const Ganache = require('ganache-core')
const watch = require('node-watch')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config.js')

const args = process.argv.slice(2)
const shouldWatch = (args.length && args[0] === 'serve')

const startGanache = () => {
  return new Promise((resolve, reject) => {
    var server = Ganache.server({
      total_accounts: 5,
      default_balance_ether: 20,
      network_id: 999,
      seed: 123,
      blocktime: 3,
      mnemonic: 'rubber negative firm purity helmet barely six asset imitate nephew october pluck'
    })
    server.listen(9545, err => {
      if (err) {
        return reject(err)
      }
      console.log('Ganache listening.')
      resolve()
    })
  })
}

const buildContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleMigrate = spawn('./node_modules/.bin/truffle', ['compile'], { cwd: './contracts' })
    truffleMigrate.stdout.pipe(process.stdout)
    truffleMigrate.stderr.pipe(process.stderr)

    truffleMigrate.on('exit', code => {
      if (code !== 0) {
        return reject()
      }
      console.log('Truffle compile finished OK.')
      resolve()
    })
  })
}

const deployContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleMigrate = spawn('./node_modules/.bin/truffle', ['migrate', '--reset', '--compile-all'], { cwd: './contracts' })
    truffleMigrate.stdout.pipe(process.stdout)
    truffleMigrate.stderr.pipe(process.stderr)

    truffleMigrate.on('exit', code => {
      if (code !== 0) {
        return reject()
      }
      console.log('Truffle migrate finished OK.')
      resolve()
    })
  })
}

async function start() {
  let compiler = webpack(webpackConfig)

  if (shouldWatch) {
    await startGanache()
    await deployContracts()

    // watch contracts
    watch('./contracts/contracts', { recursive: true }, (evt, name) => {
      console.log('%s changed.', name)
      deployContracts()
    })

    // watch js
    compiler.watch({}, (err, stats) => {
      if(err) {
        console.log(err)
      } else {
        console.log('webpack compiling')
      }
    })
  } else {
    await buildContracts()
    compiler.run((err, stats) => {
      if(err) {
        console.log(err)
      } else {
        console.log('webpack compiled successfully')
      }
    })
  }
}

start()
