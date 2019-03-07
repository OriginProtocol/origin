const baseConfig = require('../.eslintrc.js')

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    camelcase: ['error', { properties: 'never' }]
  }
}
