var config = {
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
      }
    ]
  }
}

module.exports = config
