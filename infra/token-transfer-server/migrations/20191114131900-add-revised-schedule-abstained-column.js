'use strict'

const tableName = 't3_user'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        tableName,
        'revised_schedule_abstained',
        Sequelize.BOOLEAN
      )
    ])
  },
  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn(tableName, 'revised_schedule_abstained')
    ])
  }
}
