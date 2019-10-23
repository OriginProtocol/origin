'use strict'

module.exports = (sequelize, DataTypes) => {
  const Lockup = sequelize.define(
    'Lockup',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      start: DataTypes.DATE,
      end: DataTypes.DATE,
      bonus_rate: DataTypes.FLOAT,
      amount: DataTypes.DECIMAL
    },
    {
      tableName: 't3_lockup'
    }
  )

  Lockup.associate = models => {
    Lockup.belongsTo(models.User)
  }

  return Lockup
}
