'use strict'

module.exports = (sequelize, DataTypes) => {
  const Identity = sequelize.define(
    'Identity',
    {
      ethAddress: { type: DataTypes.STRING, primaryKey: true },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      airbnb: DataTypes.STRING,
      twitter: DataTypes.STRING,
      facebookVerified: DataTypes.BOOLEAN,
      data: DataTypes.JSONB
    },
    {
      tableName: 'identity'
    }
  )

  return Identity
}
