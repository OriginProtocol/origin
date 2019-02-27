'use strict'

const TableName = 'listing'

module.exports = {
  // Note: we are changing the pk so we can't retain the existing data.
  // Drop the table and we'll re-index the data as part of rolling out this change.
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .dropTable(TableName)
      .then(() =>
        queryInterface.createTable(TableName, {
          // Listing ID format is: <network>-<version>-<listingIndex>
          id: {
            type: Sequelize.STRING(32),
            primaryKey: true
          },
          block_number: {
            type: Sequelize.INTEGER,
            primaryKey: true
          },
          log_index: {
            type: Sequelize.INTEGER,
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
      )
      .then(() => queryInterface.addIndex(TableName, ['seller_address']))
  },
  // Drop the table and don't retain the data.
  down: (queryInterface, Sequelize) => {
    return queryInterface
      .dropTable(TableName)
      .then(() =>
        queryInterface.createTable(TableName, {
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
      )
      .then(() => queryInterface.addIndex(TableName, ['seller_address']))
  }
}
