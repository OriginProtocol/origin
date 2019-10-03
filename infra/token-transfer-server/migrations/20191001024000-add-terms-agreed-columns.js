'use strict'

const tableName = 't3_user'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        tableName,
        'revised_schedule_agreed_at',
        Sequelize.DATE
      ),
      queryInterface.addColumn(tableName, 'terms_agreed_at', Sequelize.DATE)
    ])
  },
  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn(tableName, 'revised_schedule_agreed_at'),
      queryInterface.removeColumn(tableName, 'terms_agreed_at')
    ])
  }
}
