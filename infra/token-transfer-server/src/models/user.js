'use strict'

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
      termsAgreedAt: DataTypes.DATE
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
