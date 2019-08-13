'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      phone: DataTypes.STRING,
      // Email address of the user.
      email: DataTypes.STRING,
      // OTP secret key, stored encrypted.
      otpKey: DataTypes.STRING,
      otpVerified: DataTypes.BOOLEAN,
      employee: DataTypes.BOOLEAN,
      purchaseDate: DataTypes.DATE,
      purchaseRound: DataTypes.STRING,
      purchaseTotal: DataTypes.DECIMAL,
      investmentAmount: DataTypes.DECIMAL
    },
    {
      tableName: 't3_user'
    }
  )
  return User
}
