'use strict'

const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const AuthTokenGenerationLog = sequelize.define(
    'AuthTokenGenerationLog',
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
      issuedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      expiresAt: {
        allowNull: false,
        type: DataTypes.DATE
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
      tableName: 'auth_tokens_gen_log'
    }
  )

  AuthTokenGenerationLog.associate = () => {
    // associations can be defined here
  }

  return AuthTokenGenerationLog
}
