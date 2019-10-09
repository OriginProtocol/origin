'use strict'

const tableName = 'growth_campaign'
const { GrowthCampaignRewardStatuses } = require('../src/enums')


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name_key: {
        type: Sequelize.STRING
      },
      short_name_key: {
        type: Sequelize.STRING
      },
      rules: {
        type: Sequelize.JSONB
      },
      start_date: {
        type: Sequelize.DATE
      },
      end_date: {
        type: Sequelize.DATE
      },
      distribution_date: {
        type: Sequelize.DATE
      },
      cap: {
        type: Sequelize.DECIMAL
      },
      cap_used: {
        type: Sequelize.DECIMAL
      },
      cap_reached_date: {
        type: Sequelize.DATE
      },
      currency: {
        type: Sequelize.STRING,
      },
      reward_status: {
        type: Sequelize.ENUM(GrowthCampaignRewardStatuses)
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
  }
}