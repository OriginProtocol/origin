module.exports = (sequelize, DataTypes) => {
  const Seller = sequelize.define(
    'Seller',
    {
      name: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      }
    },
    {
      underscored: true,
      tableName: 'sellers'
    }
  )

  Seller.associate = function(models) {
    Seller.hasMany(models.Shop, { as: 'shops' })
  }

  return Seller
}
