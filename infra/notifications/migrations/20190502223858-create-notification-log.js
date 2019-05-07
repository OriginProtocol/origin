'use strict'

const TableName = 'notification_log'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(TableName, {
        message_fingerprint: {
          type: Sequelize.STRING(255),
          primaryKey: true,
          allowNull: false
        },
        eth_address: { type: Sequelize.STRING(255) },
        channel: { type: Sequelize.STRING(255) },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          primaryKey: true
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .then(() =>
        queryInterface.addIndex(TableName, [
          'created_at',
          'message_fingerprint'
        ])
      )
  },
  down: queryInterface => {
    return queryInterface.dropTable(TableName)
  }
}
