module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    'Event',
    {
      networkId: {
        type: DataTypes.INTEGER
      },
      shopId: {
        type: DataTypes.INTEGER
      },
      transactionHash: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.STRING
      },
      blockHash: {
        type: DataTypes.STRING
      },
      blockNumber: {
        type: DataTypes.INTEGER
      },
      timestamp: {
        type: DataTypes.INTEGER
      },
      data: {
        type: DataTypes.STRING
      },
      topic1: {
        type: DataTypes.STRING
      },
      topic2: {
        type: DataTypes.STRING
      },
      topic3: {
        type: DataTypes.STRING
      },
      topic4: {
        type: DataTypes.STRING
      },
      eventName: {
        type: DataTypes.STRING
      },
      party: {
        type: DataTypes.STRING
      },
      listingId: {
        type: DataTypes.INTEGER
      },
      offerId: {
        type: DataTypes.INTEGER
      },
      ipfsHash: {
        type: DataTypes.STRING
      }
    },
    {
      underscored: true,
      timestamps: false,
      tableName: 'events'
    }
  )
  return Event
}
