'use strict'
module.exports = (sequelize, DataTypes) => {
  const Conversee = sequelize.define(
    'Conversee',
    {
      ethAddress: { type: DataTypes.STRING(64), primaryKey: true },
      conversationId: { type: DataTypes.INTEGER, primaryKey: true }
    },
    {
      tableName: 'conversee'
    }
  )
  Conversee.associate = function(models) {
    // associations can be defined here
    Conversee.belongsTo(models.Conversation)
  }
  return Conversee
}
