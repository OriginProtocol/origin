'use strict'

const tableName = 'faucet_campaign'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      invite_code: {
        type: Sequelize.STRING
      },
      start_date: {
        type: Sequelize.DATE
      },
      end_date: {
        type: Sequelize.DATE
      },
      budget: {
        type: Sequelize.DECIMAL
      },
      amount: {
        type: Sequelize.DECIMAL
      },
      currency: {
        type: Sequelize.STRING
      }
    }).then(() => queryInterface.addIndex(tableName, ['invite_code']))
  },
  down: (queryInterface) => {
    return queryInterface.dropTable(tableName)
  }
}

