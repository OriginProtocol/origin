module.exports = (sequelize, DataTypes) => {
  const SellerShop = sequelize.define(
    'SellerShop',
    {
      sellerId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      shopId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      role: DataTypes.STRING
    },
    {
      underscored: true,
      tableName: 'seller_shop'
    }
  )

  return SellerShop
}
