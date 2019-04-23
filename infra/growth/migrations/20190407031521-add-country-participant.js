'use strict'

const tableName = 'growth_participant'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'country',
      Sequelize.CHAR(2)
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'country'
    )
  }
}

