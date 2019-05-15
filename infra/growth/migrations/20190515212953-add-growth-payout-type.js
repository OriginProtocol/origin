'use strict'

const { GrowthPayoutTypes } = require('../src/enums')

const tableName = 'growth_payout'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'type',
      {
        type: Sequelize.ENUM(GrowthPayoutTypes),
        allowNull: false,
        defaultValue: false
      }
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'type'
    )
  }
}

