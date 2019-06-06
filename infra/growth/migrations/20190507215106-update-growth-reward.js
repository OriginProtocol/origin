'use strict'

const { GrowthRewardStatuses } = require('../src/enums')

const tableName = 'growth_reward'

module.exports = {
  up: (queryInterface) => {
    return queryInterface.removeColumn(tableName, 'status')
      .then(() => queryInterface.removeColumn(tableName, 'txn_hash'))
      .then(() => queryInterface.sequelize.query('DROP TYPE enum_growth_reward_status;'))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(tableName, 'status', Sequelize.ENUM(GrowthRewardStatuses))
      .then(() => queryInterface.addColumn(tableName, 'txn_hash', Sequelize.STRING))
  }
}