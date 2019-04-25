'use strict'

module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_growth_event_type ADD VALUE 'GoogleAttestationPublished';
    `)
  },
  down: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_growth_event_type REMOVE VALUE 'GoogleAttestationPublished';
    `)
  }
}
