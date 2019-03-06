'use strict'

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    'Event',
    {
      email: DataTypes.STRING,
      ip: DataTypes.STRING,
      grantId: DataTypes.INTEGER,
      action: DataTypes.STRING,
      data: DataTypes.STRING
    },
    {}
  )
  Event.associate = function() {
    // TODO: add a hasOne association for Grant when hasOne supports sourceKey
    // (due in Sequelize 5)
  }
  return Event
}
