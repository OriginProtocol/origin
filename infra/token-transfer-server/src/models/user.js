'use strict'

const enums = require('../enums')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      // Email address of the user.
      email: { type: DataTypes.STRING, unique: true },
      // OTP secret key, stored encrypted.
      otpKey: DataTypes.STRING,
      otpVerified: DataTypes.BOOLEAN,
      employee: DataTypes.BOOLEAN,
      revisedScheduleAgreedAt: DataTypes.DATE,
      revisedScheduleStatus: DataTypes.ENUM(enums.RevisedScheduleStatus),
      termsAgreedAt: DataTypes.DATE,
      investorType: DataTypes.ENUM(enums.InvestorTypes),
      welcomed: DataTypes.BOOLEAN
    },
    {
      tableName: 't3_user'
    }
  )

  User.associate = models => {
    User.hasMany(models.Grant)
    User.hasMany(models.Lockup)
    User.hasMany(models.Transfer)
  }

  return User
}
