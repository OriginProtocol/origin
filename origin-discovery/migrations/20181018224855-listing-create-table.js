'use strict';

const TableName = 'listing'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(TableName, {
      id: {
        type: Sequelize.STRING(32),
        allowNull: false,
        primaryKey: true
      },
      seller_address: {
        type: Sequelize.CHAR(42),
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        default: true,
        allowNull: false
      },
      ipfs_hash: {
        type: Sequelize.CHAR(68),
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      block_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      block_timestamp: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addIndex(TableName, ['seller_address']))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TableName)
  }
}