module.exports = (sequelize, DataTypes) => {
  const Network = sequelize.define(
    'Network',
    {
      networkId: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true
      },
      lastBlock: {
        type: DataTypes.INTEGER
      }
    },
    {
      timestamps: false,
      underscored: true,
      tableName: 'networks'
    }
  )
  return Network
}
