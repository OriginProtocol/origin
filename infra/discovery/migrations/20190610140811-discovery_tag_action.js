'use strict'

const TableName = 'discovery_tag_action'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(TableName, {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        listing_id: {
          type: Sequelize.STRING,
          allowNull: false
        },
        eth_address: {
          type: Sequelize.STRING,
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
      .then(() =>
        queryInterface.addIndex('discovery_tag_action', {
          fields: ['listing_id']
        })
      )
  },

  down: queryInterface => {
    return queryInterface.dropTable(TableName)
  }
}
