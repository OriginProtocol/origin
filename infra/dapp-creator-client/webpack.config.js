const path = require('path')
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

const config = {
  entry: ['@babel/polyfill', './src/index.js'],
  devtool: isProduction ? false : 'cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    pathinfo: true,
    filename: '[name].[hash:8].js',
    publicPath: ''
  },
  externals: {
    Web3: 'web3'
  },
  module: {
    noParse: [/^react$/],
    rules: [
      { test: /\.flow$/, loader: 'ignore-loader' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true // true outputs JSX tags
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: isProduction ? MiniCssExtractPlugin.loader : 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[hash:8].[ext]',
              publicPath: '../'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  mode: isProduction ? 'production' : 'development',
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html', inject: false }),
    new CopyWebpackPlugin([
      'public/favicon.ico',
      'public/metamask.mp4',
      { from: 'public/images', to: 'images' }
    ]),
    new Dotenv(),
    new webpack.EnvironmentPlugin({
      DAPP_CREATOR_API_URL: null,
      DAPP_CREATOR_DOMAIN: null,
      DAPP_URL: null,
      IPFS_API_URL: null,
      IPFS_GATEWAY_URL: null,
      SSL_ISSUER_IP: null
    })
  ],
  optimization: {}
}

if (isProduction) {
  config.output.filename = '[name].[hash:8].js'

  config.optimization.minimizer = [
    new TerserPlugin({ cache: true, parallel: true }),
    new OptimizeCSSAssetsPlugin({})
  ]

  config.plugins.push(
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['public/app.*']
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css'
    })
  )

  config.plugins.push(new webpack.IgnorePlugin(/redux-logger/))
}

module.exports = config
