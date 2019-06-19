'use strict'

module.exports = (sequelize, DataTypes) => {
  const Proxy = sequelize.define(
    'Proxy',
    {
      address: { type: DataTypes.STRING, primaryKey: true },
      ownerAddress: DataTypes.STRING
    },
    {
      tableName: 'proxy'
    }
  )

  return Proxy
}
