const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')

const gitRevisionPlugin = new GitRevisionPlugin()

let gitCommitHash = process.env.GIT_COMMIT_HASH || process.env.DEPLOY_TAG,
  gitBranch = process.env.GIT_BRANCH

try {
  gitCommitHash = gitRevisionPlugin.commithash()
  gitBranch = gitRevisionPlugin.branch()
} catch (e) {
  /* No Git repo found  */
}

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
        loader: 'babel-loader',
        query: {
          plugins: [
            [
              'babel-plugin-fbt',
              {
                fbtEnumManifest: require('./translations/.enum_manifest.json')
              }
            ],
            'babel-plugin-fbt-runtime'
          ]
        }
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
                return url.match(/(svg|png)/)
              }
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
    modules: [path.resolve(__dirname, 'src/constants'), './node_modules']
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
  watchOptions: {
    poll: 2000,
    ignored: [
      // Ignore node_modules in watch except for the origin-js directory
      /node_modules([\\]+|\/)+(?!origin)/,
      /\origin([\\]+|\/)node_modules/ // eslint-disable-line no-useless-escape
    ]
  },
  mode: isProduction ? 'production' : 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/template.html',
      inject: false,
      network: 'rinkeby'
    }),
    new webpack.EnvironmentPlugin({
      BUILD_TIMESTAMP: +new Date(),
      DOCKER: false,
      ENABLE_GROWTH: false,
      FACEBOOK_CLIENT_ID: null,
      GIT_COMMIT_HASH: gitCommitHash,
      GIT_BRANCH: gitBranch,
      HOST: 'localhost',
      LINKER_HOST: 'localhost',
      ORIGIN_LINKING: null,
      IPFS_SWARM: ''
    })
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
    new MiniCssExtractPlugin({ filename: '[name].[hash:8].css' }),
    new webpack.IgnorePlugin(/redux-logger/),
    new HtmlWebpackPlugin({
      template: 'public/template.html',
      inject: false,
      filename: 'mainnet.html',
      network: 'mainnet'
    }),
    new HtmlWebpackPlugin({
      template: 'public/template.html',
      inject: false,
      filename: 'kovan.html',
      network: 'kovanTst'
    }),
    new HtmlWebpackPlugin({
      template: 'public/template.html',
      inject: false,
      filename: 'rinkeby.html',
      network: 'rinkeby'
    }),
    new HtmlWebpackPlugin({
      template: 'public/template.html',
      inject: false,
      filename: 'origin.html',
      network: 'origin'
    })
  )
  config.resolve.alias = {
    'react-styl': 'react-styl/prod.js'
  }
  config.module.noParse = [/^(react-styl)$/]
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
