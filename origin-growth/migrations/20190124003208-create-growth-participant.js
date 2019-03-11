'use strict'

const tableName = 'growth_participant'
const { GrowthParticipantStatuses } = require('../src/enums')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      eth_address: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(GrowthParticipantStatuses)
      },
      data: {
        type: Sequelize.JSONB
      },
      agreement_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      auth_token: {
        allowNull: false,
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
    })
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
  }
}