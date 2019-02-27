'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query('ALTER TABLE listing ALTER COLUMN id TYPE VARCHAR(64)')
      .then(() => {
        return queryInterface.changeColumn('offer', 'listing_id', {
          type: Sequelize.STRING(64)
        })
      })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query('ALTER TABLE listing ALTER COLUMN id TYPE VARCHAR(32)')
      .then(() => {
        return queryInterface.changeColumn('offer', 'listing_id', {
          type: Sequelize.STRING(32)
        })
      })
  }
}
