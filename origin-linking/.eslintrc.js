const baseConfig = require('../.eslintrc.js')

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    camelcase: ['warn', { properties: 'never' }]
  }
}
