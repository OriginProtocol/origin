'use strict'

const TableName = 'push_subscription'


module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS hstore;')
      .then(queryInterface.createTable(TableName, {
        id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        // not unique!
        endpoint: {
          type: Sequelize.STRING
        },
        keys: {
          type: Sequelize.HSTORE
        },
        expirationTime: {
          type: Sequelize.DATE
        },
        // not unique!
        account: {
          type: Sequelize.STRING
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }})
        .then(() => queryInterface.addIndex(TableName, ['account', 'endpoint'])))
  },
  down: (queryInterface, Sequelize) => {
    // Note: we don't remove the hstore extension since it could be used
    // by other tables.
    return queryInterface.dropTable(TableName)
  }
}
