module.exports = (sequelize, DataTypes) => {
  const Discount = sequelize.define(
    'Discount',
    {
      networkId: {
        type: DataTypes.INTEGER
      },
      shopId: {
        type: DataTypes.INTEGER
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive')
      },
      code: {
        type: DataTypes.STRING
      },
      discountType: {
        type: DataTypes.ENUM('fixed', 'percentage')
      },
      value: {
        type: DataTypes.INTEGER
      },
      maxUses: {
        type: DataTypes.INTEGER
      },
      onePerCustomer: {
        type: DataTypes.BOOLEAN
      },
      startTime: {
        type: DataTypes.DATE
      },
      endTime: {
        type: DataTypes.DATE
      },
      uses: {
        type: DataTypes.INTEGER
      }
    },
    {
      underscored: true,
      tableName: 'discounts'
    }
  )

  Discount.associate = function(models) {
    Discount.belongsTo(models.Shop, { as: 'shops', foreignKey: 'shopId' })
  }

  return Discount
}
