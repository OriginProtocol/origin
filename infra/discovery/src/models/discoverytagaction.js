'use strict'

module.exports = (sequelize, DataTypes) => {
  const DiscoveryTagAction = sequelize.define(
    'DiscoveryTagAction',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      // Moderator's eth address, lowercase.
      ethAddress: DataTypes.CHAR(42),
      // JSON tags
      data: DataTypes.JSONB,
      // Creation date.
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      tableName: 'discovery_tag_action'
    }
  )

  DiscoveryTagAction.associate = function(models) {
    DiscoveryTagAction.belongsTo(models.Listing)
  }

  return DiscoveryTagAction
}
