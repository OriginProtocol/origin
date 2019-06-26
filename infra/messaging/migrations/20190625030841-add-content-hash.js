'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('msg_message', 'contentHash', {
      type: Sequelize.STRING(66)
    })
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('msg_message', 'contentHash')
  }
}
