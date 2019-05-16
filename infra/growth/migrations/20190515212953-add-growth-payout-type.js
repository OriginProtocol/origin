'use strict'

const { GrowthPayoutTypes } = require('../src/enums')

const tableName = 'growth_payout'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      tableName,
      'type',
      {
        type: Sequelize.ENUM(GrowthPayoutTypes),
        allowNull: false,
        defaultValue: GrowthPayoutTypes.CampaignDistribution
      }
    )
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      tableName,
      'type'
    ).then(queryInterface.sequelize.query('DROP TYPE enum_growth_payout_type;'))
  }
}

