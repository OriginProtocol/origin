module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      shopId: {
        type: DataTypes.INTEGER
      },
      networkId: {
        type: DataTypes.INTEGER
      },
      orderId: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true
      },
      ipfsHash: {
        type: DataTypes.STRING
      },
      encryptedIpfsHash: {
        type: DataTypes.STRING
      },
      createdBlock: {
        type: DataTypes.INTEGER
      },
      updatedBlock: {
        type: DataTypes.INTEGER
      },
      status: {
        type: DataTypes.INTEGER
      },
      statusStr: {
        type: DataTypes.STRING
      },
      currency: {
        type: DataTypes.STRING
      },
      value: {
        type: DataTypes.STRING
      },
      commission: {
        type: DataTypes.STRING
      },
      buyer: {
        type: DataTypes.STRING
      },
      affiliate: {
        type: DataTypes.STRING
      },
      arbitrator: {
        type: DataTypes.STRING
      },
      finalizes: {
        type: DataTypes.STRING
      },
      notes: {
        type: DataTypes.TEXT
      },
      data: {
        type: DataTypes.TEXT
      },
      referrer: {
        type: DataTypes.TEXT
      },
      commissionPending: {
        type: DataTypes.INTEGER
      },
      commissionPaid: {
        type: DataTypes.INTEGER
      }
    },
    {
      underscored: true,
      timestamps: false,
      tableName: 'orders'
    }
  )

  Order.associate = function(models) {
    Order.belongsTo(models.Shop, { as: 'shops', foreignKey: 'shopId' })
  }

  return Order
}
