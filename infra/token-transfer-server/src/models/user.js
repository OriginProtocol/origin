'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      // Email address of the user.
      email: DataTypes.STRING,
      // OTP secret key, stored encrypted.
      otpKey: DataTypes.STRING
    },
    {
      tableName: 't3_user'
    }
  )
  return User
}
