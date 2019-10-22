'use strict'

const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const AuthToken = sequelize.define(
    'AuthToken',
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
      data: {
        allowNull: false,
        type: DataTypes.JSONB
      },
      signature: {
        allowNull: false,
        type: DataTypes.STRING(256)
      },
      authToken: {
        allowNull: false,
        type: DataTypes.STRING
      },
      expiresAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      ipAddress: {
        allowNull: false,
        type: DataTypes.INET
      },
      revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
      tableName: 'auth_tokens'
    }
  )

  AuthToken.associate = () => {
    // associations can be defined here
  }

  return AuthToken
}
