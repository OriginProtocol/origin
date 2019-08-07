'use strict'

const { TransferStatuses } = require('../src/enums')

const tableName = 't3_transfer'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(tableName, {
        id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        grant_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 't3_grant', key: 'id' }
        },
        status: {
          type: Sequelize.ENUM(TransferStatuses)
        },
        from_address: {
          type: Sequelize.STRING
        },
        to_address: {
          type: Sequelize.STRING
        },
        amount: {
          type: Sequelize.DECIMAL
        },
        currency: {
          type: Sequelize.STRING
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
      })
      .then(() => queryInterface.addIndex(tableName, ['to_address']))
  },
  down: queryInterface => {
    return queryInterface
      .dropTable(tableName)
      .then(
        queryInterface.sequelize.query('DROP TYPE enum_t3_transfer_status;')
      )
  }
}
