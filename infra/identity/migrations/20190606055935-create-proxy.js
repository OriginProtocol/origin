'use strict'

const tableName = 'proxy'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(tableName, {
        address: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING
        },
        owner_address: {
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
      .then(() => queryInterface.addIndex(tableName, ['owner_address']))
  },
  down: queryInterface => {
    return queryInterface.dropTable(tableName)
  }
}
