const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const [, config] = require('../webpack.config')
const { EnvironmentPlugin, NamedModulesPlugin } = require('webpack')

delete config.output

Object.assign(config, {
  devServer: {
    stats: 'errors-only',
    host: 'localhost',
    port: 8081,
    overlay: {
      errors: true,
      warnings: true,
    },
  },

  entry: path.join(__dirname, 'index.js'),

  plugins: [
    new NamedModulesPlugin(),
    new EnvironmentPlugin({
      IPFS_DOMAIN: '',
      IPFS_API_PORT: '',
      IPFS_GATEWAY_PORT: '',
      IPFS_GATEWAY_PROTOCOL: '',
    }),
    new HtmlWebpackPlugin({ title: 'Tests' }),
  ],
})

module.exports = config
