'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      // Email address of the user.
      email: { type: DataTypes.STRING, primaryKey: true },
      // OTP secret key, stored encrypted.
      otpKey: DataTypes.STRING
    },
    {
      tableName: 't3_user'
    }
  )
  return User
}
