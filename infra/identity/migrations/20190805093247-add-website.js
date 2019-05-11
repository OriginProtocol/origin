'use strict'

const tableName = 'identity'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(tableName, 'website', Sequelize.STRING)
  },
  down: queryInterface => {
    return queryInterface.removeColumn(tableName, 'website')
  }
}
