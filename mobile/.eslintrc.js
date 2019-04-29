const baseConfig = require('../.eslintrc.react.js')

module.exports = {
  ...baseConfig,
  globals: {
    ...baseConfig.globals,
    __DEV__: 'readonly'
  }
}
