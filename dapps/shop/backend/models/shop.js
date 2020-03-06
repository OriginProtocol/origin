module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define(
    'Shop',
    {
      networkId: {
        type: DataTypes.INTEGER
      },
      // e.g. 1-001-1212
      listingId: {
        type: DataTypes.STRING
      },
      sellerId: {
        type: DataTypes.INTEGER
      },
      hostname: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      authToken: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      config: {
        type: DataTypes.TEXT
      },
      firstBlock: {
        type: DataTypes.INTEGER
      },
      lastBlock: {
        type: DataTypes.INTEGER
      }
    },
    {
      underscored: true,
      tableName: 'shops'
    }
  )

  Shop.associate = function(models) {
    Shop.belongsTo(models.Seller, { as: 'sellers', foreignKey: 'sellerId' })
    Shop.hasMany(models.Order, { as: 'orders', targetKey: 'shopId' })
    Shop.hasMany(models.Transaction, { as: 'transactions' })
    Shop.hasMany(models.Discount, { as: 'discounts' })
  }

  return Shop
}
