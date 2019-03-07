'use strict'

const { EthNotificationTypes } = require('origin/common/enums')
const TableName = 'wallet_notification_endpoint'

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
        eth_address: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        wallet_token: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        device_token: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        device_type: {
          type: Sequelize.ENUM(EthNotificationTypes),
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
      .then(() => queryInterface.addIndex(TableName, ['eth_address']))
  },
  down: queryInterface => {
    return queryInterface.dropTable(TableName)
  }
}
