var nodeExternals = require('webpack-node-externals');

var serverConfig = {
  entry: ["babel-polyfill", './src/index.js'],
  output: {
    filename: './index.js',
    libraryTarget: 'commonjs2'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    /**
    * Overriding the default to allow jsx to be resolved automatically.
    */
    extensions: ['.js', '.json', '.jsx'],
    /**
    * Access config from anywhere via `import settings from 'settings'``
    */
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['env', 'es2015', 'react'],
          plugins: ['transform-class-properties']
        }
      }
    ]
  }
}

var clientConfig = {
  entry: ["babel-polyfill", './src/index.js'],
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
          presets: ['babel-preset-es2015'],
          plugins: ['transform-class-properties']
        }
      }
    ]
  }

}

module.exports = [ serverConfig, clientConfig ];
