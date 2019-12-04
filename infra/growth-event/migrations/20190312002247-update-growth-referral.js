'use strict'

const tableName = 'growth_referral'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(tableName)
      .then(() => 
        queryInterface.createTable(tableName, {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          referrer_eth_address: {
            allowNull: false,
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
          .then(() => queryInterface.addIndex(tableName, ['referrer_eth_address']))
      )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(tableName)
      .then(() => 
        queryInterface.createTable(tableName, {
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
      )
  }
}