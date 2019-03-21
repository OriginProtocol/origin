'use strict'

const TableName = 'push_subscription'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query('CREATE EXTENSION IF NOT EXISTS hstore;')
      .then(() => {
        return queryInterface
          .createTable(TableName, {
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
            expiration_time: {
              type: Sequelize.DATE
            },
            // not unique!
            account: {
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
          .then(() => {
            return queryInterface.addIndex(TableName, ['account', 'endpoint'])
          })
      })
  },
  down: queryInterface => {
    // Note: we don't remove the hstore extension since it could be used
    // by other tables.
    return queryInterface.dropTable(TableName)
  }
}
