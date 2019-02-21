'use strict'

const { GrowthRewardStatuses } = require('../src/enums')

const tableName = 'growth_reward'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM(GrowthRewardStatuses)
      },
      eth_address: {
        type: Sequelize.STRING
      },
      campaign_id: {
        type: Sequelize.INTEGER
      },
      level_id: {
        type: Sequelize.INTEGER
      },
      rule_id: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.DECIMAL
      },
      currency: {
        type: Sequelize.STRING
      },
      txn_hash: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addIndex(tableName, ['eth_address', 'campaign_id']))
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
      .then(queryInterface.sequelize.query('DROP TYPE enum_growth_reward_status;'))

  }
}