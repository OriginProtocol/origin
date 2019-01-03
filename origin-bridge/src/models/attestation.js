'use strict'

module.exports = (sequelize, DataTypes) => {
  const Attestation = sequelize.define('Attestation', {
    // Attestation id
    id: { type: DataTypes.INTEGER, primaryKey: true },
    // Ethereum address of the attestation
    ethAddress: DataTypes.CHAR(42),
    // Value of the attestation
    value: DataTypes.STRING,
    // Signature of the attestation
    signature: DataTypes.STRING,
    // IP address of the user the attestation was generated for
    remoteIpAddress: DataTypes.INET,
    // Creation date
    createdAt: DataTypes.DATE,
  }, {
    tableName: 'listing'
  })

  Attestation.associate = function () {
    // associations can be defined here
  }

  return Attestation
}
