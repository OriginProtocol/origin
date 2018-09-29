const webpack = require('webpack')
const path = require('path')
const Dotenv = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const prepareMessagesPlugin = require('./translations/scripts/prepareMessagesPlugin')

const isProduction = process.env.NODE_ENV === 'production'

// Only env vars that are keys in this object will get passed through to 
// the DApp when webpack runs. If no env var is present, the value here
// will be used as the default. See /#/dapp-info page on running Dapp
// to see all env vars.
const env = {
  ARBITRATOR_ACCOUNT: null,
  AFFILIATE_ACCOUNT: null,
  BRIDGE_SERVER_DOMAIN: null,
  BRIDGE_SERVER_PROTOCOL: 'https',
  CONTRACT_ADDRESSES: '{}',
  DEPLOY_TAG: false,
  DISCOVERY_SERVER_URL: null,
  ETH_NETWORK_ID: null,
  FORCE_HTTPS: false,
  IPFS_API_PORT: null,
  IPFS_DOMAIN: null,
  IPFS_GATEWAY_PORT: null,
  IPFS_GATEWAY_PROTOCOL: 'https',
  IPFS_SWARM: null,
  MAINNET_DAPP_BASEURL: null,
  MESSAGING_ACCOUNT: null,
  MESSAGING_NAMESPACE: null,
  PRODUCTION_DOMAIN: null,
  PROVIDER_URL: null,
  REDUX_LOGGER: false,
  RINKEBY_DAPP_BASEURL: null
}

var config = {
  entry: { app: './src/index.js' },
  devtool: isProduction ? false : 'inline-cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    pathinfo: true,
    filename: '[name].[hash:8].js',
    publicPath: ''
  },
  module: {
    noParse: [/^react$/],
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: { url: false }
          }
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /\.js$/,
        use: "source-map-loader",
        exclude: [
          // Don't load source maps from anything in node_modules except for the
          // origin-js directory
          /node_modules([\\]+|\/)+(?!origin)/,
          /\origin([\\]+|\/)node_modules/
        ],
        enforce: "pre"
      }
    ]
  },
  devServer: {
    contentBase: './public',
    port: 3000,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    overlay: {
      warnings: true,
      errors: true
    }
  },
  watchOptions: {
    ignored: [
      // Ignore node_modules in watch except for the origin-js directory
      /node_modules([\\]+|\/)+(?!origin)/,
      /\origin([\\]+|\/)node_modules/
    ]
  },
  mode: isProduction ? 'production' : 'development',
  plugins: [
    new CleanWebpackPlugin(['build']),
    new HtmlWebpackPlugin({
      template: isProduction ? 'public/index.html' : 'public/dev.html'
    }),
    new Dotenv(),
    new webpack.EnvironmentPlugin(env),
    new CopyWebpackPlugin([
      'public/favicon.ico',
      { from: 'public/images', to: 'images' },
      { from: 'public/fonts', to: 'fonts' },
      { from: 'public/schemas', to: 'schemas' }
    ]),
    new prepareMessagesPlugin()
  ]
}

if (isProduction) {
  config.plugins.push(new MiniCssExtractPlugin({
    filename: '[name].[hash].css',
    chunkFilename: '[id].[hash].css'
  }))
}

module.exports = config
