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
      method: DataTypes.ENUM('PHONE', 'EMAIL', 'AIRBNB', 'FACEBOOK', 'TWITTER'),
      // Ethereum address of the attestation. Lowercase.
      ethAddress: DataTypes.CHAR(42),
      // Value of the attestation
      value: DataTypes.STRING,
      // Signature of the attestation
      signature: DataTypes.STRING,
      // IP address of the user the attestation was generated for
      remoteIpAddress: DataTypes.INET,
      // Creation date
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    },
    {
      tableName: 'attestation'
    }
  )
  Attestation.AttestationTypes = {
    PHONE: 'PHONE',
    EMAIL: 'EMAIL',
    AIRBNB: 'AIRBNB',
    FACEBOOK: 'FACEBOOK',
    TWITTER: 'TWITTER'
  }
  Attestation.associate = function() {
    // associations can be defined here
  }
  return Attestation
}
