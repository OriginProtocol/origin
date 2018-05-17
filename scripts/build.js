const chalk = require('chalk');
const startGanache = require('./helpers/start-ganache')
const buildContracts = require('./helpers/build-contracts')
const deployContracts = require('./helpers/deploy-contracts')
const startIpfs = require('./helpers/start-ipfs')
const startTestServer = require('./helpers/start-test-server')
const watch = require('node-watch')
const webpack = require('webpack')
const webpackConfig = require('../webpack.config.js')

const args = process.argv.slice(2)
const shouldWatch = (args.length && args[0] === 'serve')

const start = async () => {
  let compiler = webpack(webpackConfig)

  if (shouldWatch) {
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Starting Local Blockchain }\n`);
    await startGanache()
    console.log(chalk`\n{bold.hex('#26d198') ⬢  Deploying Smart Contracts }\n`);
    await deployContracts()
    console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Starting Local IPFS }\n`);
    await startIpfs()

    // watch contracts
    watch('./contracts/contracts', { recursive: true }, (evt, name) => {
      console.log('%s changed.', name)
      deployContracts()
    })

    // watch js
    compiler.watch({}, (err, stats) => {
      if(err || stats.hasErrors()) {
        console.error(err)
      } else {
        console.log(stats.toString({
          hash: false,
          modules: false,
          version: false
        }))
      }
    })

    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Starting Test Server }\n`);
    startTestServer()
  } else {
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Compiling Smart Contracts }\n`);
    await buildContracts()
    console.log(chalk`\n{bold.hex('#26d198') ⬢  Compiling Webpack }\n`);
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
