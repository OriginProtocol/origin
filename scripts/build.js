const chalk = require('chalk')
const fs = require('fs-extra')
const startGanache = require('./helpers/start-ganache')
const buildContracts = require('./helpers/build-contracts')
const deployContracts = require('./helpers/deploy-contracts')
const startIpfs = require('./helpers/start-ipfs')
const startTestServer = require('./helpers/start-test-server')
const watch = require('node-watch')
const webpack = require('webpack')
const webpackConfig = require('../webpack.config.js')

const args = process.argv.slice(2)
const shouldWatch = args.length && args[0] === 'serve'
const noGanache = args.length && args[1] === 'no-ganache'

/**
 * Copies compiled contracts from the latest release to
 * the contracts build directory.
 */
const copyReleaseCompiledContracts = (dstDir) => {
  // Get list of release directories.
  let dirs = fs.readdirSync('contracts/releases')
  dirs = dirs.filter(dir => (/^\d+\.\d+\.\d+$/.test(dir)))

  // Get latest release directory.
  const latestVersion = dirs.sort().reverse()[0]

  // Create build directory if it does not exist.
  if (!fs.pathExists(dstDir)) {
    fs.mkdirpSync(dstDir)
  }

  // Copy compiled contract files from latest release to the build directory.
  const srcDir = `contracts/releases/${latestVersion}/build/contracts`
  fs.copySync(srcDir, dstDir)
  console.log(chalk.green(`Copied compiled contracts from ${srcDir} to ${dstDir}`))
}

const start = async () => {
  const compiler = webpack(webpackConfig)

  // If the contract build directory does not exist or is empty,
  // copy the compiled contract files from the latest release into it.
  const dstDir = 'contracts/build/contracts'
  if (fs.pathExists(dstDir) && fs.readdirSync(dstDir).length > 0) {
    console.log(chalk.blue('Contracts build directory already exists and not empty, skipping copy.'))
  } else {
    copyReleaseCompiledContracts(dstDir)
  }
  if (shouldWatch) {
    if (!noGanache) {
      console.log(
        chalk`\n{bold.hex('#1a82ff') ⬢  Starting Local Blockchain }\n`
      )
      await startGanache()
    }
    console.log(chalk`\n{bold.hex('#26d198') ⬢  Deploying Smart Contracts }\n`)
    await deployContracts()
    console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Starting Local IPFS }\n`)
    await startIpfs()

    // watch contracts
    watch('./contracts/contracts', { recursive: true }, (evt, name) => {
      console.log('%s changed.', name)
      deployContracts()
    })

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
  } else {
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Compiling Smart Contracts }\n`)
    await buildContracts()
    console.log(chalk`\n{bold.hex('#26d198') ⬢  Compiling Webpack }\n`)
    compiler.run(err => {
      if (err) {
        console.log(err)
      } else {
        console.log('webpack compiled successfully')
      }
    })
  }
}

start()
