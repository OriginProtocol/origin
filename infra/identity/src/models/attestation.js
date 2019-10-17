'use strict'

const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const Attestation = sequelize.define(
    'Attestation',
    {
      // Attestation id
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      // Attestation method
      method: DataTypes.ENUM(
        'PHONE',
        'EMAIL',
        'AIRBNB',
        'FACEBOOK',
        'TWITTER',
        'GOOGLE',
        'WEBSITE',
        'KAKAO',
        'GITHUB',
        'LINKEDIN',
        'WECHAT',
        'TELEGRAM'
      ),
      // Ethereum address of the attestation. Lowercase.
      ethAddress: DataTypes.CHAR(42),
      // Value of the attestation
      // For OAuth attestations, this contains the unique Id of the user
      value: DataTypes.STRING,
      // Signature of the attestation
      signature: DataTypes.STRING,
      // IP address of the user the attestation was generated for
      remoteIpAddress: DataTypes.INET,
      // Creation date
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      // Username/user handle for OAuth Attestations
      username: DataTypes.STRING,
      // Link to public profile, if available
      profileUrl: DataTypes.STRING,
      // Raw response
      profileData: DataTypes.JSONB
    },
    {
      tableName: 'attestation',
      timestamps: false
    }
  )
  Attestation.AttestationTypes = {
    PHONE: 'PHONE',
    EMAIL: 'EMAIL',
    AIRBNB: 'AIRBNB',
    FACEBOOK: 'FACEBOOK',
    TWITTER: 'TWITTER',
    GOOGLE: 'GOOGLE',
    WEBSITE: 'WEBSITE',
    KAKAO: 'KAKAO',
    GITHUB: 'GITHUB',
    LINKEDIN: 'LINKEDIN',
    WECHAT: 'WECHAT',
    TELEGRAM: 'TELEGRAM'
  }
  Attestation.associate = function() {
    // associations can be defined here
  }
  return Attestation
}
