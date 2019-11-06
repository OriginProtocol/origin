'use strict'

const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const AuthTokenBlacklist = sequelize.define(
    'AuthTokenBlacklist',
    {
      authToken: {
        allowNull: false,
        type: DataTypes.TEXT,
        primaryKey: true
      },
      revokedBy: {
        allowNull: false,
        type: DataTypes.STRING
      },
      reason: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now')
      }
    },
    {
      tableName: 'authtokens_blacklist'
    }
  )

  AuthTokenBlacklist.associate = () => {
    // associations can be defined here
  }

  return AuthTokenBlacklist
}
