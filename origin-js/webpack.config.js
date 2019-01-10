const nodeExternals = require('webpack-node-externals');

/*
 * Generate `origin.node.js` which is used inside node apps.`
*/
const serverConfig = {
  entry: ["@babel/polyfill", './src/index.js'],
  output: {
    filename: './origin.node.js',
    libraryTarget: 'commonjs2'
  },
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.js', '.json', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-proposal-class-properties']
        }
      }
    ]
  }
}

/*
 * Generate `origin.js` file that may be used standalone in browser
 * This is used by our docs, and included in our github release.
*/

const clientConfig = {
  entry: ["@babel/polyfill", './src/index.js'],
  output: {
    filename: './origin.js',
    libraryTarget: 'var',
    library: 'Origin'
  },
  mode: 'production',
  devtool: false,
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-proposal-class-properties']
        }
      }
    ]
  }
}

module.exports = [ serverConfig, clientConfig ]

