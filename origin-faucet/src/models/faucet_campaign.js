'use strict'

module.exports = (sequelize, DataTypes) => {
  const FaucetCampaign = sequelize.define(
    'FaucetCampaign',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      name: DataTypes.STRING,
      inviteCode: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      budget: DataTypes.DECIMAL,
      amount: DataTypes.DECIMAL,
      currency: DataTypes.STRING
    },
    {
      tableName: 'faucet_campaign'
    }
  )

  return FaucetCampaign
}
