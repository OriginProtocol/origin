'use strict'

const tableName = 'identity'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(tableName, 'kakao_verified', Sequelize.BOOLEAN)
  },
  down: queryInterface => {
    return queryInterface.removeColumn(tableName, 'kakao_verified')
  }
}
