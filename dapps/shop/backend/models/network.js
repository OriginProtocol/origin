module.exports = (sequelize, DataTypes) => {
  const Network = sequelize.define(
    'Network',
    {
      networkId: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true
      },
      // name: DataTypes.STRING,
      lastBlock: DataTypes.INTEGER,
      provider: DataTypes.STRING,
      providerWs: DataTypes.STRING,
      ipfs: DataTypes.STRING,
      ipfsApi: DataTypes.STRING,
      marketplaceContract: DataTypes.STRING,
      marketplaceVersion: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      config: DataTypes.TEXT
    },
    {
      timestamps: false,
      underscored: true,
      tableName: 'networks'
    }
  )
  return Network
}
