'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('msg_message', 'read', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('msg_message', 'read')
  }
}
