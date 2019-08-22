module.exports = function (api) {
  api.cache(true)

  const presets = [
    '@babel/preset-env',
    '@babel/preset-react'
  ]

  const plugins = [
    [
      'module-resolver',
      {
        'alias': {
          'actions': './src/actions',
          'components': './src/components',
          'constants': './src/constants',
          'contracts': './src/contracts',
          'pages': './src/pages',
          'reducers': './src/reducers',
          'utils': './src/utils',
          'hoc': './src/hoc',
          'queries': './src/queries',
          'mutations': './src/mutations'
        }
      }
    ],
    [
      '@babel/plugin-proposal-decorators',
      {
        'legacy': true
      }
    ],
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-destructuring',
    '@babel/plugin-transform-object-assign',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-strict-mode'
  ]

  return {
    presets,
    plugins,
    babelrcRoots: ['.', './dapps/*', './infra/*', './packages/*']
  }
}
