'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Session', {
      sid: {
        type: Sequelize.STRING(36),
        primaryKey: true
      },
      expires: Sequelize.DATE,
      data: Sequelize.TEXT,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })
  },

  down: queryInterface => {
    return queryInterface.dropTable('Session')
  }
}
