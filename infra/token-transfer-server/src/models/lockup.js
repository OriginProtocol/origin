'use strict'

module.exports = (sequelize, DataTypes) => {
  const Lockup = sequelize.define(
    'Lockup',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      start: DataTypes.DATE,
      end: DataTypes.DATE,
      bonusRate: DataTypes.INTEGER,
      amount: DataTypes.INTEGER
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
