'use strict'

const tableName = 'growth_participant'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      eth_address: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.JSONB
      },
      agreement_id: {
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