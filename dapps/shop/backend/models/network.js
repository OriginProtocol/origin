module.exports = (sequelize, DataTypes) => {
  const Network = sequelize.define(
    'Network',
    {
      networkId: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true
      },
      lastBlock: DataTypes.INTEGER,
      provider: DataTypes.STRING,
      providerWs: DataTypes.STRING
    },
    {
      timestamps: false,
      underscored: true,
      tableName: 'networks'
    }
  )
  return Network
}
