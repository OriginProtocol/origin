const baseConfig = require('../.eslintrc.js')

module.exports = {
  ...baseConfig,
  globals: {
    web3: true
  }
}
