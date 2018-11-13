const webpack = require('webpack')
const webpackConfig = require('../webpack.config.js')

const build = async () => {
  const compiler = webpack(webpackConfig)
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
