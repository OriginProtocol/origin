'use strict'

const tableName = 'identity'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(tableName, 'linkedin_verified', Sequelize.BOOLEAN)
  },
  down: queryInterface => {
    return queryInterface.removeColumn(tableName, 'linkedin_verified')
  }
}
