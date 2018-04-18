const spawn = require('child_process').spawn
const Ganache = require('ganache-core')

const PORT = 8545

const startGanache = () => {
  return new Promise((resolve, reject) => {
    var server = Ganache.server({
      total_accounts: 5,
      default_balance_ether: 20,
      network_id: 999,
      seed: 123,
      blocktime: 0,
      mnemonic: 'rubber negative firm purity helmet barely six asset imitate nephew october pluck'
    })
    server.listen(PORT, err => {
      if (err) {
        return reject(err)
      }
      console.log(`Ganache listening on port ${PORT}`)
      resolve()
    })
  })
}

const testContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleTest = spawn('../node_modules/.bin/truffle', ['test'], { cwd: './contracts' })
    truffleTest.stdout.pipe(process.stdout)
    truffleTest.stderr.pipe(process.stderr)

    truffleTest.on('exit', code => {
      if (code !== 0) {
        return reject()
      }
      resolve()
    })
  })
}

const deployContracts = () => {
  return new Promise((resolve, reject) => {
    const truffleMigrate = spawn('../node_modules/.bin/truffle', ['migrate', '--reset', '--compile-all'], { cwd: './contracts' })
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

const testJavascript = () => {
  return new Promise((resolve, reject) => {
    const mocha = spawn('./node_modules/.bin/mocha', ['--compilers', 'js:babel-core/register', '--require', 'babel-polyfill'])
    mocha.stdout.pipe(process.stdout)
    mocha.stderr.pipe(process.stderr)

    mocha.on('exit', code => {
      if (code !== 0) {
        return reject()
      }
      resolve()
    })
  })
}

async function start() {
  try {
    await startGanache()
    await testContracts()
    await deployContracts()
    await testJavascript()
    console.log('All tests successful. :)')
    process.exit()
  }
  catch(error) {
    console.log('Some tests failed. :(')
    process.exit()
  }
}

start()
