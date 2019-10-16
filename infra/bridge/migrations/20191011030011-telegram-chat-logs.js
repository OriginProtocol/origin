'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('telegram_chat_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      raw_payload: {
        type: Sequelize.JSONB
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    })
  },
  down: queryInterface => {
    return queryInterface.dropTable('telegram_chat_logs')
  }
}
