'use strict'

const tableName = 'growth_referral'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      referrer_eth_address: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      referee_eth_address: {
        allowNull: false,
        unique: true,
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
    }).then(() => queryInterface.addIndex(tableName, ['referee_eth_address']))
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
  }
}