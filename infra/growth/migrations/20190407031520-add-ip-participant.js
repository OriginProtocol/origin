'use strict'

const tableName = 'growth_participant'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'ip',
      Sequelize.INET
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'ip'
    )
  }
}
