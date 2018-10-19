'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // Wallet address.
    address: {
      type: DataTypes.CHAR(42),
      primaryKey: true
    },
    identityAddress: {
      type: DataTypes.CHAR(42),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName:'user'
  })

  User.removeAttribute('id');

  User.associate = function(models) {
    // associations can be defined here
  }

  return User
}
