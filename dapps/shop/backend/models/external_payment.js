module.exports = (sequelize, DataTypes) => {
  const ExternalPayment = sequelize.define(
    'ExternalPayment',
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      ordered_at: DataTypes.DATE,
      external_id: DataTypes.STRING,
      order_id: DataTypes.STRING,
      data: DataTypes.TEXT,
      amount: DataTypes.INTEGER
    },
    {
      underscored: true,
      tableName: 'external_payments'
    }
  )

  ExternalPayment.associate = function(models) {
    ExternalPayment.belongsTo(models.Order, {
      as: 'externalPayments',
      foreignKey: 'orderId'
    })
  }

  return ExternalPayment
}
