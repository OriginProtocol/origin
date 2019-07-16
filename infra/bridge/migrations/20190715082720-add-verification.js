'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('verification', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eth_address: {
        type: Sequelize.STRING
      },
      social_network: {
        type: Sequelize.ENUM('TWITTER')
      },
      type: {
        type: Sequelize.ENUM('FOLLOW', 'SHARE')
      },
      // Content to be shared for "SHARE" type
      content: {
        type: Sequelize.STRING
      },
      status: {
        // VERIFYING = Pushed to the queue and polling is in progress to verify
        // SHARED = Public account and everything is OK.
        // FAILED = Account is protected/private, failed to verify
        // UNSHARED = Is a public account, but couldn't verify after 'n' tries
        type: Sequelize.ENUM('VERIFYING', 'SHARED', 'FAILED', 'UNSHARED'),
        defaultValue: 'VERIFYING'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },
      last_verified: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    })
  },
  down: queryInterface => {
    return queryInterface.dropTable('verification')
  }
}
