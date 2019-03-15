'use strict'
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      conversationId: { type: DataTypes.INTEGER, primaryKey: true },
      conversationIndex: { type: DataTypes.INTEGER, primaryKey: true },
      ethAddress: DataTypes.STRING(64),
      data: DataTypes.JSON,
      signature: DataTypes.STRING(256),
      isKeys: DataTypes.BOOLEAN
    },
    {
      tableName: 'msg_message'
    }
  )
  Message.associate = function(models) {
    // associations can be defined here
    Message.belongsTo(models.Conversation)
  }
  return Message
}
