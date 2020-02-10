'use strict'

const tableName = 'growth_admin_activity'
const { GrowthAdminActivityActions } = require('../src/enums')


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eth_address: {
        type: Sequelize.STRING
      },
      action: {
        type: Sequelize.ENUM(GrowthAdminActivityActions)
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
    }).then(() => queryInterface.addIndex(tableName, ['eth_address']))
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
  }
}
