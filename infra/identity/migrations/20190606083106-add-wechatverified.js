'use strict'

const tableName = 'identity'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(tableName, 'wechat_verified', Sequelize.BOOLEAN)
  },
  down: queryInterface => {
    return queryInterface.removeColumn(tableName, 'wechat_verified')
  }
}
