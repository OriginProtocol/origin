module.exports = (sequelize, DataTypes) => {
  const ExternalOrder = sequelize.define(
    'ExternalOrder',
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      external_id: DataTypes.STRING,
      order_id: DataTypes.STRING,
      data: DataTypes.TEXT,
      payment_at: DataTypes.DATE,
      amount: DataTypes.INTEGER,
      fee: DataTypes.INTEGER,
      net: DataTypes.INTEGER
    },
    {
      underscored: true,
      tableName: 'external_orders'
    }
  )

  ExternalOrder.associate = function(models) {
    ExternalOrder.belongsTo(models.Order, { as: 'externalOrders', foreignKey: 'orderId' })
  }

  return ExternalOrder
}
