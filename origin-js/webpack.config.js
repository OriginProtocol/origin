var nodeExternals = require('webpack-node-externals');

/*
 * Generate index.js used in `origin` npm package.
 * This is used by our DApp.
*/
var serverConfig = {
  entry: ["babel-polyfill", './src/index.js'],
  output: {
    filename: './index.js',
    libraryTarget: 'commonjs2'
  },
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
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

/*
 * Generate `origin.js` file that may be used standalone in browser
 * This is used by our docs, and included in our github release.
*/
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
