'use strict'

const TableName = 'mobile_registry'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(TableName, {
        eth_address: {
          type: Sequelize.STRING(255),
          allowNull: false,
          primaryKey: true
        },
        device_token: {
          type: Sequelize.STRING(255),
          allowNull: false,
          primaryKey: true
        },
        device_type: {
          type: Sequelize.ENUM('APN', 'FCM'),
          allowNull: false
        },
        permissions: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        deleted: {
          type: Sequelize.BOOLEAN,
          allowNull: false
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
      .then(() =>
        queryInterface.addIndex(TableName, ['eth_address', 'device_token'])
      )
  },
  down: queryInterface => {
    return queryInterface.dropTable(TableName)
  }
}
