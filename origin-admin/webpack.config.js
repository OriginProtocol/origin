const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

const config = {
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
  node: {
    fs: 'empty'
  },
  devServer: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  mode: isProduction ? 'production' : 'development',
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/template.html', inject: false }),
    new webpack.EnvironmentPlugin({ HOST: 'localhost' })
  ],

  optimization: {
    // splitChunks: {
    //   cacheGroups: {
    //     app: {
    //       chunks: 'all',
    //       name: 'app',
    //       enforce: true,
    //       reuseExistingChunk: true,
    //     }
    //   }
    // },
  }
}

if (isProduction) {
  config.output.filename = '[name].[hash:8].js'
  config.optimization.minimizer = [
    new TerserPlugin({ cache: true, parallel: true }),
    new OptimizeCSSAssetsPlugin({})
  ]
  config.plugins.push(
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['public/app.*.css', 'public/app.*.js']
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css'
    })
  )
  config.plugins.push(new webpack.IgnorePlugin(/redux-logger/))
  // config.resolve.alias = {
  //   react: 'react/umd/react.production.min.js',
  //   'react-dom': 'react-dom/umd/react-dom.production.min.js',
  //   'react-styl': 'react-styl/prod.js',
  //   web3: path.resolve(__dirname, 'public/web3.min'),
  //   redux: 'redux/dist/redux.min.js',
  //   'react-redux': 'react-redux/dist/react-redux.min.js',
  //   'react-router-dom': 'react-router-dom/umd/react-router-dom.min.js'
  // }
  // config.module.noParse = [
  //   /^(react|react-dom|react-styl|redux|react-redux|react-router-dom)$/,
  //   /web3/
  // ]
}

module.exports = config
