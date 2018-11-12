const chalk = require('chalk')
const startGanache = require('./helpers/start-ganache')
const deployContracts = require('./helpers/deploy-contracts')
const startIpfs = require('./helpers/start-ipfs')
const startTestServer = require('./helpers/start-test-server')
const webpack = require('webpack')
const webpackConfig = require('../webpack.config.js')

const args = process.argv.slice(2)
const noGanache = args.length && args[0] === 'no-ganache'

const start = async () => {
  const compiler = webpack(webpackConfig)
  if (!noGanache) {
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Starting Local Blockchain }\n`)
    await startGanache()
  }
  console.log(chalk`\n{bold.hex('#26d198') ⬢  Deploying Smart Contracts }\n`)
  await deployContracts()
  console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Starting Local IPFS }\n`)
  await startIpfs()

  // watch js
  compiler.watch({}, (err, stats) => {
    if (err || stats.hasErrors()) {
      console.error(err)
    } else {
      console.log(
        stats.toString({
          hash: false,
          modules: false,
          version: false
        })
      )
    }
  })

  console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Starting Test Server }\n`)
  startTestServer()
}

start()
