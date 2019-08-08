'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query(`
      ALTER TYPE enum_growth_event_type ADD VALUE IF NOT EXISTS 'LikedOnFacebook';
    `)
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve()
  }
};
