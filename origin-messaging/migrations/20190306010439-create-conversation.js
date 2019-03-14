'use strict'
const TableName = 'conversation'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(TableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      external_id: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true
      },
      message_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      data: {
        type: Sequelize.JSON
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(TableName)
  }
}
