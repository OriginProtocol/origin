const extraNodeModules = require('node-libs-react-native')
extraNodeModules.vm  = require.resolve('vm-browserify')

module.exports = {
  resolver: {
    extraNodeModules
  },
};
