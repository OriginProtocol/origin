'use strict'

const tableName = 'growth_participant'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'employee',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'employee'
    )
  }
}
