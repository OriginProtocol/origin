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
      // Not removing the following two for backward compatability
      facebookVerified: DataTypes.BOOLEAN,
      googleVerified: DataTypes.BOOLEAN,
      facebook: DataTypes.STRING,
      google: DataTypes.STRING,
      kakao: DataTypes.STRING,
      github: DataTypes.STRING,
      linkedin: DataTypes.STRING,
      wechat: DataTypes.STRING,
      data: DataTypes.JSONB,
      country: DataTypes.CHAR(2),
      avatarUrl: DataTypes.STRING,
      website: DataTypes.STRING,
      telegram: DataTypes.STRING
    },
    {
      tableName: 'identity'
    }
  )

  return Identity
}
