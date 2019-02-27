'use strict'

const TableName = 'listing'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(TableName, {
        // Listing ID format is: <network>-<version>-<listingIndex>
        id: {
          type: Sequelize.STRING(32),
          primaryKey: true
        },
        seller_address: {
          type: Sequelize.CHAR(42),
          allowNull: false
        },
        status: {
          type: Sequelize.STRING(32),
          allowNull: false
        },
        data: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      })
      .then(() => queryInterface.addIndex(TableName, ['seller_address']))
  },
  down: queryInterface => {
    return queryInterface.dropTable(TableName)
  }
}
