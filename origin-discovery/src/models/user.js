'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    ethAddress: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    data: DataTypes.JSONB
  }, {
    tableName: 'user'
  })

  return User
}