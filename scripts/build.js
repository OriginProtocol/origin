const startGanache = require('./start-ganache')
const buildContracts = require('./build-contracts')
const deployContracts = require('./deploy-contracts')
const startTestServer = require('./start-test-server')
const watch = require('node-watch')
const webpack = require('webpack')
const webpackConfig = require('../webpack.config.js')

const args = process.argv.slice(2)
const shouldWatch = (args.length && args[0] === 'serve')

const start = async () => {
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

    startTestServer()
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
