'use strict'

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    'Event',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: DataTypes.INTEGER,
      action: DataTypes.STRING,
      data: DataTypes.JSONB
    },
    {
      tableName: 't3_event'
    }
  )
  Event.associate = models => {
    Event.belongsTo(models.User)
  }
  return Event
}
