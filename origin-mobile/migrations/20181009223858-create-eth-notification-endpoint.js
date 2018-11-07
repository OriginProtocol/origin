'use strict';
const {EthNotificationTypes} = require('origin/common/enums');
const TableName = 'eth_notification_endpoint';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(TableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eth_address: {
        type: Sequelize.STRING(255),
        allowNull:false
      },
      device_token: {
        type: Sequelize.STRING(255),
        allowNull:false
      },
      type: {
        type: Sequelize.ENUM(EthNotificationTypes),
        allowNull:false
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      verified: {
        type: Sequelize.BOOLEAN
      },
      expires_at: {
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
    }).then(() => queryInterface.addIndex(TableName, ['eth_address']))
      .then(() => queryInterface.addIndex(TableName, ['type', 'device_token']));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TableName);
  }
};
