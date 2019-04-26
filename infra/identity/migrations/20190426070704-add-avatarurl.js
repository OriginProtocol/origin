'use strict'

const tableName='identity'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'avatarUrl',
      Sequelize.STRING
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'avatarUrl'
    )
  }
}