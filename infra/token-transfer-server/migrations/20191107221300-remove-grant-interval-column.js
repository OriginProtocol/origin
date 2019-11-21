'use strict'

const tableName = 't3_grant'

module.exports = {
  up: queryInterface => {
    return Promise.all([queryInterface.removeColumn(tableName, 'interval')])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        tableName,
        'interval',
        Sequelize.ENUM([
          'years',
          'months',
          'weeks',
          'days',
          'hours',
          'minutes',
          'seconds'
        ])
      )
    ])
  }
}
