'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('attestation', 'profile_data', {
      type: Sequelize.JSONB
    })
  },

  down: queryInterface => {
    return queryInterface.removeColumn('attestation', 'profile_data')
  }
}
