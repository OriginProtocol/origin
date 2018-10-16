const buildContracts = require('./helpers/build-contracts')
const copyReleaseCompiledContracts = require('./helpers/copy-release-compiled-contracts')
const webpack = require('webpack')
const webpackConfig = require('../webpack.config.js')

const build = async () => {
  const compiler = webpack(webpackConfig)
  copyReleaseCompiledContracts()
  console.log('Compiling Smart Contracts')
  await buildContracts()
  console.log('Compiling Webpack')
  compiler.run(err => {
    if (err) {
      console.log(err)
    } else {
      console.log('webpack compiled successfully')
    }
  })
}

build()