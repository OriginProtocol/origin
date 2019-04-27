'use strict'

const tableName='identity'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'avatar_url',
      Sequelize.STRING
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'avatar_url'
    )
  }
}