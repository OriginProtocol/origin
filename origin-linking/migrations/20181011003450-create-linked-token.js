'use strict';
const {EthNotificationTypes} = require('origin/common/enums');
const TableName = 'linked_token';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(TableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      client_token: {
        type: Sequelize.STRING(255),
        allowNull:false
      },
      device_token: {
        type: Sequelize.STRING(255)
      },
      device_type: {
        type: Sequelize.ENUM(EthNotificationTypes)
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
    }).then(() => queryInterface.addIndex(TableName, ['client_token']))
      .then(() => queryInterface.addIndex(TableName, ['device_type', 'device_token']))
      .then(() => queryInterface.addIndex(TableName, ['code']));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TableName);
  }
};
