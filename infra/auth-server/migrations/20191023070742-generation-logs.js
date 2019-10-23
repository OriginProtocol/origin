'use strict'

const tableName = 'auth_tokens_gen_log'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eth_address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      data: {
        allowNull: false,
        type: Sequelize.JSONB
      },
      signature: {
        allowNull: false,
        type: Sequelize.STRING(256)
      },
      issued_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      expires_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      ip_address: {
        allowNull: false,
        type: Sequelize.INET
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
