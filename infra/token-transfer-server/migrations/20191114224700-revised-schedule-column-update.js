'use strict'

const { RevisedScheduleStatus } = require('../src/enums')

const tableName = 't3_user'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(tableName, 'revised_schedule_abstained'),
      queryInterface.removeColumn(tableName, 'revised_schedule_rejected'),
      queryInterface.addColumn(
        tableName,
        'revised_schedule_status',
        Sequelize.ENUM(RevisedScheduleStatus)
      )
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        tableName,
        'revised_schedule_abstained',
        Sequelize.BOOLEAN
      ),
      queryInterface.removeColumn(tableName, 'revised_schedule_status'),
      queryInterface.addColumn(
        tableName,
        'revised_schedule_rejected',
        Sequelize.BOOLEAN
      )
    ])
  }
}
