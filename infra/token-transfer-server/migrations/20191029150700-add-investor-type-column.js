'use strict'

const { InvestorTypes } = require('../src/enums')

const tableName = 't3_user'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        tableName,
        'investor_type',
        Sequelize.ENUM(InvestorTypes)
      )
    ])
  },
  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn(tableName, 'investor_type')
    ])
  }
}
