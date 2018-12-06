var path = require('path')
var webpack = require('webpack')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

var config = {
  entry: {
    app: './src/index.js'
  },
  devtool: isProduction ? false : 'cheap-module-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public')
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
  mode: isProduction ? 'production' : 'development',
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html', inject: false })
  ]
}

if (isProduction) {
  config.output.filename = '[name].[hash:8].js',
  config.optimization.minimizer = [
    new TerserPlugin({ cache: true, parallel: true }),
    new OptimizeCSSAssetsPlugin({})
  ]
  config.plugins.push(
    new CleanWebpackPlugin(['public/app.*', 'public/styles.*']),
    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css'
    })
  )
  config.plugins.push(new webpack.IgnorePlugin(/redux-logger/))
}

module.exports = config

