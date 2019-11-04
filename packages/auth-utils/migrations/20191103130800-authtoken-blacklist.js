'use strict'

const tableName = 'authtokens_blacklist'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      auth_token: {
        allowNull: false,
        type: Sequelize.TEXT,
        primaryKey: true
      },
      revoked_by: {
        allowNull: false,
        type: Sequelize.STRING
      },
      reason: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    })
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName)
  }
}
