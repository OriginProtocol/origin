'use strict'

const TABLE_NAME = 'event'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(TABLE_NAME, {
        block_number: {
          type: Sequelize.INTEGER,
          primaryKey: true
        },
        log_index: {
          type: Sequelize.INTEGER,
          primaryKey: true
        },
        transaction_index: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        block_hash: {
          type: Sequelize.CHAR(66),
          allowNull: false
        },
        transaction_hash: {
          type: Sequelize.CHAR(66),
          allowNull: false
        },
        topic0: {
          type: Sequelize.CHAR(66)
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
        address: {
          type: Sequelize.CHAR(42),
          allowNull: false
        },
        event: {
          type: Sequelize.STRING,
          allowNull: false
        },
        signature: {
          type: Sequelize.STRING,
          allowNull: false
        },
        data: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        return_values: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      })
      .then(() => queryInterface.addIndex(TABLE_NAME, ['event']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['address']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['contract_address']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['transaction_hash']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['block_number']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['topic0']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['topic1']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['topic2']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['topic3']))
  },

  down: queryInterface => {
    return queryInterface.dropTable(TABLE_NAME)
  }
}
