'use strict'

module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define(
    'Account',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: DataTypes.INTEGER,
      nickname: DataTypes.STRING,
      address: DataTypes.STRING
    },
    {
      tableName: 't3_account'
    }
  )
  return Account
}
