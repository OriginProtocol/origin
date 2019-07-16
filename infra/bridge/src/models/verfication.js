'use strict'

const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const Verification = sequelize.define(
    'Verification', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      ethAddress: {
        type: DataTypes.STRING
      },
      socialNetwork: {
        type: DataTypes.ENUM('TWITTER')
      },
      type: {
        type: DataTypes.ENUM('FOLLOW', 'SHARE')
      },
      // Content to be shared for "SHARE" type
      content: {
        type: DataTypes.STRING
      },
      status: {
        // VERIFYING = Pushed to the queue and polling is in progress to verify
        // SHARED = Public account and everything is OK.
        // FAILED = Account is protected/private, failed to verify
        // UNSHARED = Is a public account, but couldn't verify after 'n' tries
        type: DataTypes.ENUM('VERIFYING', 'SHARED', 'FAILED', 'UNSHARED'),
        defaultValue: 'VERIFYING'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },
      last_verified: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    },
    {
      tableName: 'verification'
    }
  )
  Verification.PromotionTypes = {
    FOLLOW: 'FOLLOW',
    SHARE: 'SHARE'
  }
  Verification.SupportedNetworks = {
    TWITTER: 'TWITTER'
  }
  Verification.VerificationStatus = {
    VERIFYING: 'VERIFYING',
    SHARED: 'SHARED',
    FAILED: 'FAILED',
    UNSHARED: 'UNSHARED'
  }
  return Verification
}
