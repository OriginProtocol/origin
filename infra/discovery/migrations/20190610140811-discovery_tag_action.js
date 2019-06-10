'use strict'

const TableName = 'discovery_tag_action'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(TableName, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      listing_id: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      eth_address: {
        type: Sequelize.CHAR(42),
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TableName)
  }
}
