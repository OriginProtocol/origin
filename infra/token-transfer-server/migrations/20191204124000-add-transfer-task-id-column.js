'use strict'

const tableName = 't3_transfer'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(tableName, 'transfer_task_id', {
      type: Sequelize.INTEGER,
      references: { model: 't3_transfer_task', key: 'id' }
    })
  },
  down: queryInterface => {
    return queryInterface.removeColumn(tableName, 'transfer_task_id')
  }
}
