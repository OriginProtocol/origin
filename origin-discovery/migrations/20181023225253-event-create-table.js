'use strict'

const TableName = 'event'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(TableName, {
        block_number: {
          type: Sequelize.INTEGER,
          primaryKey: true
        },
        log_index: {
          type: Sequelize.INTEGER,
          primaryKey: true
        },
        contract_address: {
          type: Sequelize.CHAR(42),
          allowNull: false
        },
        transaction_hash: {
          type: Sequelize.CHAR(66),
          allowNull: false
        },
        topic0: {
          type: Sequelize.CHAR(66),
          allowNull: false
        },
        topic1: {
          type: Sequelize.CHAR(66),
          allowNull: true
        },
        topic2: {
          type: Sequelize.CHAR(66),
          allowNull: true
        },
        topic3: {
          type: Sequelize.CHAR(66),
          allowNull: true
        },
        data: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      })
      .then(() => queryInterface.addIndex(TableName, ['contract_address']))
      .then(() => queryInterface.addIndex(TableName, ['transaction_hash']))
      .then(() => queryInterface.addIndex(TableName, ['topic0']))
      .then(() => queryInterface.addIndex(TableName, ['topic1']))
      .then(() => queryInterface.addIndex(TableName, ['topic2']))
      .then(() => queryInterface.addIndex(TableName, ['topic3']))
  },

  down: queryInterface => {
    return queryInterface.dropTable(TableName)
  }
}
