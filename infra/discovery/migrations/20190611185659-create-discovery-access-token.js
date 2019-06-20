'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('discovery_access_token', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        auth_token: {
          type: Sequelize.STRING
        },
        eth_address: {
          type: Sequelize.STRING
        },
        nonce: {
          type: Sequelize.STRING
        },
        expires: {
          type: Sequelize.DATE
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
      .then(() =>
        queryInterface.addIndex('discovery_access_token', {
          fields: ['eth_address', 'nonce']
        })
      )
      .then(() =>
        queryInterface.addIndex('discovery_access_token', {
          fields: ['auth_token']
        })
      )
  },
  down: queryInterface => {
    return queryInterface.dropTable('discovery_access_token')
  }
}
