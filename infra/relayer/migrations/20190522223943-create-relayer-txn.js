'use strict'

const tableName = 'relayer_txn'

const enums = require('../src/enums')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM(enums.RelayerTxnStatuses)
      },
      from: {
        type: Sequelize.STRING
      },
      to: {
        type: Sequelize.STRING
      },
      method: {
        type: Sequelize.STRING
      },
      forwarder: {
        type: Sequelize.STRING
      },
      gas: {
        type: Sequelize.INTEGER
      },
      tx_hash: {
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
    }).then(() => queryInterface.addIndex(tableName, ['from', 'created_at']))
      .then(() => queryInterface.addIndex(tableName, ['created_at']))
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
  }
}

