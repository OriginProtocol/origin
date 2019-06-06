'use strict'

const tableName = 'growth_participant'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'ban',
      Sequelize.JSONB
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'ban'
    )
  }
}
