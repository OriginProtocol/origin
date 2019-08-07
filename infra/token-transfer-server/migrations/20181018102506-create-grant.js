'use strict'

const tableName = 't3_grant'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 't3_user', key: 'id' }
      },
      start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cliff: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cancelled: {
        type: Sequelize.DATE
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      interval: {
        type: Sequelize.ENUM([
          'years',
          'months',
          'weeks',
          'days',
          'hours',
          'minutes',
          'seconds'
        ]),
        allowNull: false
      },
      // Auto-generated by Sequelize
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
  down: queryInterface => {
    return queryInterface.dropTable(tableName)
  }
}
