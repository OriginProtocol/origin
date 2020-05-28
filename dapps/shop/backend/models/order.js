module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      shopId: DataTypes.INTEGER,
      networkId: DataTypes.INTEGER,
      orderId: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true
      },
      ipfsHash: DataTypes.STRING,
      encryptedIpfsHash: DataTypes.STRING,
      createdBlock: DataTypes.INTEGER,
      updatedBlock: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      statusStr: DataTypes.STRING,
      currency: DataTypes.STRING,
      value: DataTypes.STRING,
      commission: DataTypes.STRING,
      buyer: DataTypes.STRING,
      affiliate: DataTypes.STRING,
      arbitrator: DataTypes.STRING,
      finalizes: DataTypes.STRING,
      notes: DataTypes.TEXT,
      data: DataTypes.TEXT,
      referrer: DataTypes.TEXT,
      commissionPending: DataTypes.INTEGER,
      commissionPaid: DataTypes.INTEGER,
      createdAt: DataTypes.DATE
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
