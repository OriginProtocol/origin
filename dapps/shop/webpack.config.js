require('dotenv').config()
const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
const SriPlugin = require('webpack-subresource-integrity')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let localContractAddress
try {
  const Addresses = require(`@origin/contracts/build/contracts.json`)
  localContractAddress = Addresses.Marketplace_V01
} catch (e) {
  /* Ignore */
}

const isProduction = process.env.NODE_ENV === 'production'

let theme = ''
try {
  const themePath = `${__dirname}/data/${process.env.DATA_DIR}/theme.scss`
  theme = fs.readFileSync(themePath).toString()
} catch (e) {
  // Ignore
}

let siteConfig = {}
try {
  const siteConfigPath = `${__dirname}/data/${process.env.DATA_DIR}/config.json`
  siteConfig = JSON.parse(fs.readFileSync(siteConfigPath).toString())
} catch (e) {
  // Ignore
}

let devtool = 'cheap-module-source-map'
if (isProduction) {
  devtool = false
}

const absolute = process.env.ABSOLUTE ? true : false // Absolute js / css files

const webpackConfig = {
  entry: {
    app: './src/index.js'
  },
  devtool,
  output: {
    filename: '[name].js',
    chunkFilename: `dist/[name].[hash:8].bundle.js`,
    path: path.resolve(__dirname, 'public'),
    publicPath: absolute ? '/' : '',
    crossOriginLoading: 'anonymous'
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
            loader: 'css-loader',
            options: {
              url: url => {
                return url.match(/(svg|png)/) ? false : true
              }
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          {
            loader: isProduction ? MiniCssExtractPlugin.loader : 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              url: url => {
                return url.match(/(svg|png)/) ? false : true
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              prependData: theme
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: isProduction ? 'file-loader' : 'url-loader',
            options: isProduction ? { name: 'fonts/[name].[ext]' } : {}
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [path.resolve(__dirname, 'src/constants'), './node_modules'],
    symlinks: false
  },
  node: {
    fs: 'empty'
  },
  devServer: {
    port: 9000,
    host: '0.0.0.0',
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'data')],
    proxy: {
      context: (path, req) => !(path.match(/^\//) && req.method === 'GET'),
      target: 'http://0.0.0.0:3000'
    }
  },
  watchOptions: {
    poll: 2000
  },
  mode: isProduction ? 'production' : 'development',
  plugins: [
    new SriPlugin({
      hashFuncNames: ['sha256', 'sha384'],
      enabled: isProduction
    }),
    new HtmlWebpackPlugin({
      template: 'public/template.html',
      inject: false,
      network: process.env.NETWORK || 'localhost',
      provider: process.env.PROVIDER,
      analytics: process.env.ANALYTICS,
      fbPixel: process.env.FB,
      title: siteConfig.metaTitle || siteConfig.fullTitle,
      metaDescription: siteConfig.metaDescription,
      dataDir: process.env.DATA_DIR,
      absolute
    }),
    new webpack.EnvironmentPlugin({
      WEBPACK_BUILD: true,
      NODE_ENV: process.env.NODE_ENV || 'development',
      MARKETPLACE_CONTRACT: localContractAddress,
      NETWORK: process.env.NETWORK || 'localhost',
      DATA_DIR: process.env.DATA_DIR || '',
      CONTENT_CDN: process.env.CONTENT_CDN || '',
      CONTENT_HASH: process.env.CONTENT_HASH || '',
      ABSOLUTE: process.env.ABSOLUTE || ''
    })
  ],

  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}

if (isProduction) {
  webpackConfig.output.filename = '[name].[hash:8].js'
  webpackConfig.optimization.minimizer = [
    new TerserPlugin({ extractComments: false }),
    new OptimizeCSSAssetsPlugin({})
  ]
  webpackConfig.plugins.push(
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        'app.*.css',
        'app.*.js',
        'app.*.js.map',
        'vendors*',
        'dist/*.bundle.js'
      ]
    }),
    new MiniCssExtractPlugin({ filename: '[name].[hash:8].css' })
  )
  webpackConfig.resolve.alias = {
    'react-styl': 'react-styl/prod.js'
  }
  webpackConfig.module.noParse = [/^(react-styl)$/]
}

module.exports = webpackConfig
