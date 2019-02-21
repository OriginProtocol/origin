'use strict'

const { GrowthEventTypes, GrowthEventStatuses } = require('../src/enums')

const tableName = 'growth_event'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      custom_id: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM(GrowthEventTypes)
      },
      status: {
        type: Sequelize.ENUM(GrowthEventStatuses)
      },
      eth_address: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.JSONB
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addIndex(tableName, ['eth_address', 'type', 'custom_id']))

  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
      .then(queryInterface.sequelize.query('DROP TYPE enum_growth_event_type;'))
      .then(queryInterface.sequelize.query('DROP TYPE enum_growth_event_status;'))
  }
}
