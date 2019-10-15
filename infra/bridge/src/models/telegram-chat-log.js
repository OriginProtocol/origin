'use strict'

const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const TelegramChatLog = sequelize.define(
    'TelegramChatLog',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      message: {
        type: DataTypes.STRING
      },
      userId: {
        type: DataTypes.STRING
      },
      username: {
        type: DataTypes.STRING
      },
      rawPayload: {
        type: DataTypes.JSONB
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    },
    {
      tableName: 'telegram_chat_logs'
    }
  )
  TelegramChatLog.associate = function() {
    // associations can be defined here
  }
  return TelegramChatLog
}
