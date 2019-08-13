'use strict'

const tableName = 'identity'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(tableName, 'telegram', Sequelize.STRING)
  },
  down: queryInterface => {
    return queryInterface.removeColumn(tableName, 'telegram')
  }
}
