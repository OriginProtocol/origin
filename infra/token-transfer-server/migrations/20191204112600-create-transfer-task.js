'use strict'

const tableName = 't3_transfer_task'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      start: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end: {
        type: Sequelize.DATEONLY
      }
    })
  },
  down: queryInterface => {
    return queryInterface.dropTable(tableName)
  }
}
