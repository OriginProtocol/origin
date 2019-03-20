'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Event', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: false
      },
      grant_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Grant', key: 'id' }
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      data: {
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
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Event')
  }
}
