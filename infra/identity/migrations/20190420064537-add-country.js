'use strict'

const tableName='identity'

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
