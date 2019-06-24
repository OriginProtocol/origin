'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('identity', 'facebook', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('identity', 'google', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('identity', 'kakao', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('identity', 'github', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('identity', 'linkedin', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('identity', 'wechat', {
        type: Sequelize.STRING
      })
    ])
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('identity', 'facebook'),
      queryInterface.removeColumn('identity', 'google'),
      queryInterface.removeColumn('identity', 'kakao'),
      queryInterface.removeColumn('identity', 'github'),
      queryInterface.removeColumn('identity', 'linkedin'),
      queryInterface.removeColumn('identity', 'wechat')
    ])
  }
};
