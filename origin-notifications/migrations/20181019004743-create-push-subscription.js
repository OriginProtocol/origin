'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('PushSubscriptions', {
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
      }
    }).then(() => queryInterface.addIndex('PushSubscriptions', ['account', 'endpoint'] ))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('PushSubscriptions')
  }
}
