'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('attestation', 'username', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('attestation', 'profile_url', {
        type: Sequelize.STRING
      })
    ])
  },

  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn('attestation', 'username'),
      queryInterface.removeColumn('attestation', 'profile_url')
    ])
  }
}
