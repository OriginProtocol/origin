'use strict'

const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const AuthTokenBlacklist = sequelize.define(
    'AuthTokenBlacklist',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      ethAddress: {
        allowNull: false,
        type: DataTypes.STRING
      },
      authToken: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      ipAddress: {
        allowNull: false,
        type: DataTypes.INET
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
      tableName: 'auth_tokens_blacklist'
    }
  )

  AuthTokenBlacklist.associate = () => {
    // associations can be defined here
  }

  return AuthTokenBlacklist
}
