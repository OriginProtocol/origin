'use strict'

const tableName = 'growth_payout'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'data',
      {
        type: Sequelize.JSONB,
        allowNull: false,
      }
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'data'
    )
  }
}