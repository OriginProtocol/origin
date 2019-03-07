'use strict'

const TableName = 'linked_token'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(TableName, {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        client_token: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        wallet_token: {
          type: Sequelize.STRING(255)
        },
        code: {
          type: Sequelize.STRING(255)
        },
        code_expires: {
          type: Sequelize.DATE
        },
        client_pub_key: {
          type: Sequelize.STRING(128)
        },
        current_device_context: {
          type: Sequelize.JSON
        },
        pending_call_context: {
          type: Sequelize.JSON
        },
        linked: {
          type: Sequelize.BOOLEAN
        },
        app_info: {
          type: Sequelize.JSON
        },
        linked_at: {
          type: Sequelize.DATE
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
      .then(() => queryInterface.addIndex(TableName, ['client_token']))
      .then(() => queryInterface.addIndex(TableName, ['wallet_token']))
      .then(() => queryInterface.addIndex(TableName, ['code']))
  },
  down: queryInterface => {
    return queryInterface.dropTable(TableName)
  }
}
