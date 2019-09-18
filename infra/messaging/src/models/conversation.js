'use strict'
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    'Conversation',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      externalId: { type: DataTypes.STRING(128), unique: true },
      data: DataTypes.JSON, // this should contain the info about the conversation
      messageCount: { type: DataTypes.INTEGER, defaultValue: 0 }
    },
    {
      tableName: 'msg_conversation'
    }
  )
  Conversation.associate = function(models) {
    // // associations can be defined here
    // Conversation.hasMany(models.Message, {
    //   foreignKey: 'conversationId',
    //   sourceKey: 'id',
    //   as: 'messages'
    // })
    // Conversation.hasMany(models.Conversee, {
    //   foreignKey: 'conversationId',
    //   sourceKey: 'id',
    //   as: 'conversee'
    // })
  }
  return Conversation
}
