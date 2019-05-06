'use strict'

const tableName = 'growth_participant'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'ban_reason',
      Sequelize.JSONB
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'ban_reason'
    )
  }
}
