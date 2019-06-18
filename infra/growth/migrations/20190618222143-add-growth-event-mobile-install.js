'use strict'

module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_growth_event_type ADD VALUE 'MobileAppInstalled';
    `)
  },
  down: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_growth_event_type REMOVE VALUE 'MobileAppInstalled';
    `)
  }
}
