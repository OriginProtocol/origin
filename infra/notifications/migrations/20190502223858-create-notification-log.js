'use strict'

const TableName = 'notification_log'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(TableName, {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true
        },
        send_date: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          primaryKey: true
        },
        message_fingerprint: { type: Sequelize.STRING(255), primaryKey: true },
        eth_address: { type: Sequelize.STRING(255) },
        channel: { type: Sequelize.STRING(255) },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .then(() =>
        queryInterface.addIndex(TableName, ['send_date', 'message_fingerprint'])
      )
  },
  down: queryInterface => {
    return queryInterface.dropTable(TableName)
  }
}
