module.exports = (sequelize, DataTypes) => {
  const Seller = sequelize.define(
    'Seller',
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING
    },
    {
      underscored: true,
      tableName: 'sellers'
    }
  )

  Seller.associate = function(models) {
    Seller.belongsToMany(models.Shop, { through: models.SellerShop })
  }

  return Seller
}
