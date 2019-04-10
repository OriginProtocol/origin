'use strict'

const TABLE_NAME = 'event'

module.exports = {
  up: (queryInterface) => {
    return queryInterface.dropTable(TABLE_NAME)
  },

  down: (queryInterface, Sequelize) => {
    // The above is kind of irreversible, but...
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
      .then(() => queryInterface.addIndex(TABLE_NAME, ['contract_address']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['transaction_hash']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['topic0']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['topic1']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['topic2']))
      .then(() => queryInterface.addIndex(TABLE_NAME, ['topic3']))
  }
};
