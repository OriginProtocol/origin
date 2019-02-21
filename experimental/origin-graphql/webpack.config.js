const path = require('path')
const webpack = require('webpack')

const config = {
  target: 'web',
  entry: {
    app: './src/index.js'
  },
  devtool: false,
  output: {
    filename: 'origin-graphql.js',
    path: path.resolve(__dirname, 'dist')
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
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  node: {
    fs: 'empty'
  },
  mode: 'development',
  plugins: [new webpack.EnvironmentPlugin({ HOST: 'localhost' })]
}

module.exports = config
