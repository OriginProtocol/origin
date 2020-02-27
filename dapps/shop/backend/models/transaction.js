module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      networkId: {
        type: DataTypes.INTEGER,
        unique: 'compositeIndex',
        primaryKey: true
      },
      shopId: {
        type: DataTypes.INTEGER
      },
      transactionHash: {
        type: DataTypes.STRING,
        unique: 'compositeIndex',
        primaryKey: true
      },
      blockNumber: {
        type: DataTypes.INTEGER
      }
    },
    {
      underscored: true,
      tableName: 'transactions',
      timestamps: false
    }
  )

  Transaction.associate = function(models) {
    Transaction.belongsTo(models.Shop, { as: 'shops', foreignKey: 'shopId' })
  }

  return Transaction
}
