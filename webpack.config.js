const webpack = require('webpack')
const path = require('path')
const Dotenv = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const prepareMessagesPlugin = require('./translations/scripts/prepareMessagesPlugin')

const isProduction = process.env.NODE_ENV === 'production'

const env = {
  ARBITRATOR_ACCOUNT: '',
  AFFILIATE_ACCOUNT: '',
  BRIDGE_SERVER_DOMAIN: '',
  BRIDGE_SERVER_PROTOCOL: 'https',
  CONTRACT_ADDRESSES: '{}',
  DEPLOY_TAG: false,
  DISCOVERY_SERVER_URL: '',
  ETH_NETWORK_ID: 1,
  FORCE_HTTPS: false,
  IPFS_API_PORT: '',
  IPFS_DOMAIN: '',
  IPFS_GATEWAY_PORT: '',
  IPFS_GATEWAY_PROTOCOL: 'https',
  IPFS_SWARM: '',
  MESSAGING_ACCOUNT: '',
  MESSAGING_NAMESPACE: '',
  PRODUCTION_DOMAIN: '',
  PROVIDER_URL: '',
  REDUX_LOGGER: false
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
