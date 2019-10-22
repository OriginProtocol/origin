'use strict'

module.exports = (sequelize, DataTypes) => {
  const Lockup = sequelize.define(
    'Lockup',
    {
      user_id: DataTypes.INTEGER,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      bonus_rate: DataTypes.INTEGER
    },
    {}
  )

  Lockup.associate = models => {
    Lockup.belongsTo(models.User)
  }

  return Lockup
}
