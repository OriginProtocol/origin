module.exports = (sequelize, DataTypes) => {
  const ShopDeployment = sequelize.define(
    'ShopDeployment',
    {
      shopId: DataTypes.INTEGER,
      ipfsHash: DataTypes.STRING
    },
    {
      underscored: true,
      tableName: 'shop_deployments'
    }
  )

  ShopDeployment.associate = function(models) {
    ShopDeployment.belongsTo(models.Shop, { as: 'shopDeployments', foreignKey: 'shopId' })
  }

  return ShopDeployment
}
