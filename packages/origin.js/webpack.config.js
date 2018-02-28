var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: './dist/index.js',
    libraryTarget: 'commonjs2'
  },
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
    loaders: [
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
};
