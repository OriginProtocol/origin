'use strict'

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_growth_participant_status ADD VALUE IF NOT EXISTS 'Closed';
    `)
  },

  down: () => {
    return Promise.resolve()
  }
}
