'use strict'

module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_growth_event_type ADD VALUE IF NOT EXISTS 'WeChatAttestationPublished';
    `)
  },
  down: () => {
    // Return an empty promise since Postgres does not support deleting an enum value.
    return Promise.resolve()
  }
}
