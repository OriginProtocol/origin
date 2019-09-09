/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path')

const externalPackages = {
  '@origin/graphql': path.resolve(__dirname + '/../packages/graphql/'),
  '@origin/contracts': path.resolve(__dirname + '/../packages/contracts/'),
  'react-native-samsung-bks': path.resolve(
    __dirname + '/../packages/react-native-samsung-bks'
  )
}

const extraNodeModules = {
  // ...require('node-libs-react-native'),
  ...externalPackages
}
// extraNodeModules.vm = require.resolve('vm-browserify')

const watchFolders = [
  path.resolve(__dirname + '/../node_modules/'),
  ...Object.values(externalPackages)
]

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false
      }
    })
  },
  resolver: {
    extraNodeModules
  },
  watchFolders
}
