'use strict'

module.exports = (sequelize, DataTypes) => {
  const Grant = sequelize.define(
    'Grant',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      grantType: { type: DataTypes.STRING },
      start: { type: DataTypes.DATE, allowNull: false },
      end: { type: DataTypes.DATE, allowNull: false },
      cliff: { type: DataTypes.DATE, allowNull: false },
      cancelled: { type: DataTypes.DATE },
      amount: { type: DataTypes.INTEGER, allowNull: false },
      interval: {
        type: DataTypes.ENUM([
          'years',
          'months',
          'weeks',
          'days',
          'hours',
          'minutes',
          'seconds'
        ]),
        allowNull: false
      },
      purchaseDate: DataTypes.DATE,
      purchaseRound: DataTypes.STRING,
      purchaseTotal: DataTypes.DECIMAL,
      investmentAmount: DataTypes.DECIMAL
    },
    {
      tableName: 't3_grant'
    }
  )

  Grant.associate = models => {
    Grant.hasMany(models.Transfer)
  }

  return Grant
}
