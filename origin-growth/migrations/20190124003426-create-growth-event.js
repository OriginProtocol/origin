'use strict';

const { GrowthEventTypes } = require('../src/enums')

const tableName = 'growth_event';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM(GrowthEventTypes)
      },
      eth_address: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.JSONB
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addIndex(tableName, ['eth_address', 'type']));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(tableName);
  }
};