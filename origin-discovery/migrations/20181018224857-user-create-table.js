'use strict';

const TableName = 'user'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(TableName, {
      address: {
        type: Sequelize.CHAR(42),
        allowNull: false,
        primaryKey: true
      },
      identity_address: {
        type: Sequelize.CHAR(42),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.addIndex(TableName, ['identity_address']))

  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TableName)
  }
}